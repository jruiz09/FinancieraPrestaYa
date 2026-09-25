import {
  sequelize,
  Owner,
  Oficina,
  Zone,
  Supervisor,
  Collector,
  User,
  Role
} from '../models/index.js'

import { ROLES } from '../config/auth.js'

/*
=====================================================
Puebla datos de prueba ya separados por Oficina, sobre el
owner que ya tiene los usuarios administrativos reales
(el otro owner de la base no tiene usuarios asociados).

3 Oficinas (Sitio de Montevideo, Córdoba, Eva Perón), 5
Zonas (Zona 2 compartida entre Sitio y Córdoba a propósito,
para poder probar el caso que motivó el fix: misma zona,
oficinas distintas), 5 Supervisores y 5 Cobradores con
usuario de login (cobrador1..5 / supervisor1..5, contraseña
"123456"), y al usuario "administrativo" existente se le
asignan 2 de las 3 oficinas para poder probar el selector
obligatorio de login y el aislamiento.

Se ejecuta a mano, una sola vez:
  node src/scripts/seedDatosOficinas.js
=====================================================
*/

const PASSWORD_DEFAULT = '123456'

const seedDatosOficinas = async () => {

  const transaction = await sequelize.transaction()

  try {

    const owner = await Owner.findOne({
      where: { fullName: 'Oficina Eva Peron' },
      transaction
    })

    if (!owner) {
      throw new Error('No se encontró el owner esperado.')
    }

    const rolSupervisor = await Role.findOne({
      where: { name: ROLES.SUPERVISOR },
      transaction
    })

    const rolCobrador = await Role.findOne({
      where: { name: ROLES.COBRADOR },
      transaction
    })

    if (!rolSupervisor || !rolCobrador) {
      throw new Error('Faltan los roles SUPERVISOR/COBRADOR.')
    }

    // OFICINAS

    const [sitio, cordoba, evaPeron] = await Promise.all(
      ['Sitio de Montevideo', 'Córdoba', 'Eva Perón'].map(
        nombre =>
          Oficina.create(
            { nombre, ownerId: owner.id, activa: true },
            { transaction }
          )
      )
    )

    // ZONAS

    const zonas = {}

    for (let i = 1; i <= 5; i++) {

      zonas[i] = await Zone.create(
        {
          nombre: `Zona ${i}`,
          ownerId: owner.id,
          activa: true,
          latitudCentro: -34.7000 + i * 0.01,
          longitudCentro: -58.3900 + i * 0.01
        },
        { transaction }
      )

    }

    // ZONA 2 A PROPÓSITO COMPARTIDA ENTRE SITIO Y CÓRDOBA

    await sitio.setZonas(
      [zonas[1].id, zonas[2].id],
      { transaction }
    )

    await cordoba.setZonas(
      [zonas[2].id, zonas[3].id],
      { transaction }
    )

    await evaPeron.setZonas(
      [zonas[4].id, zonas[5].id],
      { transaction }
    )

    // SUPERVISORES (+ usuario de login)

    const supervisoresConfig = [
      { n: 1, oficina: sitio },
      { n: 2, oficina: sitio },
      { n: 3, oficina: cordoba },
      { n: 4, oficina: evaPeron },
      { n: 5, oficina: evaPeron }
    ]

    const supervisores = {}

    for (const cfg of supervisoresConfig) {

      const usuario = await User.create(
        {
          name: `Supervisor ${cfg.n}`,
          username: `supervisor${cfg.n}`,
          password: PASSWORD_DEFAULT,
          roleId: rolSupervisor.id,
          ownerId: owner.id
        },
        { transaction }
      )

      supervisores[cfg.n] = await Supervisor.create(
        {
          nombre: 'Supervisor',
          apellido: `${cfg.n}`,
          ownerId: owner.id,
          oficinaId: cfg.oficina.id,
          userId: usuario.id
        },
        { transaction }
      )

    }

    // COBRADORES (+ usuario de login)

    const cobradoresConfig = [
      { n: 1, oficina: sitio, zona: zonas[1], supervisor: supervisores[1] },
      { n: 2, oficina: sitio, zona: zonas[2], supervisor: supervisores[2] },
      { n: 3, oficina: cordoba, zona: zonas[2], supervisor: supervisores[3] },
      { n: 4, oficina: cordoba, zona: zonas[3], supervisor: supervisores[3] },
      { n: 5, oficina: evaPeron, zona: zonas[4], supervisor: supervisores[4] }
    ]

    for (const cfg of cobradoresConfig) {

      const usuario = await User.create(
        {
          name: `Cobrador ${cfg.n}`,
          username: `cobrador${cfg.n}`,
          password: PASSWORD_DEFAULT,
          roleId: rolCobrador.id,
          ownerId: owner.id
        },
        { transaction }
      )

      await Collector.create(
        {
          nombre: 'Cobrador',
          apellido: `${cfg.n}`,
          dni: `${30000000 + cfg.n}`,
          ownerId: owner.id,
          zoneId: cfg.zona.id,
          supervisorId: cfg.supervisor.id,
          oficinaId: cfg.oficina.id,
          userId: usuario.id
        },
        { transaction }
      )

    }

    // "administrativo" existente: se lo restringe a 2 de las 3
    // oficinas (todas menos Eva Perón), para poder probar el
    // selector de login y que el aislamiento funciona.

    const administrativo = await User.findOne({
      where: { username: 'administrativo' },
      transaction
    })

    if (administrativo) {

      await administrativo.setOficinas(
        [sitio.id, cordoba.id],
        { transaction }
      )

    }

    await transaction.commit()

    console.log('Datos de oficinas sembrados:')
    console.log('- Oficinas: Sitio de Montevideo, Córdoba, Eva Perón')
    console.log('- Zonas: Zona 1..5 (Zona 2 compartida Sitio/Córdoba)')
    console.log('- Supervisores: supervisor1..5 / contraseña 123456')
    console.log('- Cobradores: cobrador1..5 / contraseña 123456')
    console.log('- "administrativo" ahora ve solo Sitio de Montevideo + Córdoba')

    process.exit(0)

  } catch (error) {

    await transaction.rollback()

    console.error('Error al sembrar datos de oficinas:', error)

    process.exit(1)

  }

}

seedDatosOficinas()
