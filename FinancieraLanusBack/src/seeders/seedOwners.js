import { Owner } from '../models/index.js';

export const seedOwners = async () => {
  const owners = [
    { 
      fullName: 'Oficina Sitio de Montevideo',
      documentNumber: 'SITIO001',
      email: 'sitio@financieralanus.com',
      phone: '+598901234567',
      address: 'Avenida 18 de Julio 1234, Montevideo'
    },
    { 
      fullName: 'Oficina Eva Peron',
      documentNumber: 'EVAPERON001',
      email: 'evaperon@financieralanus.com',
      phone: '+598987654321',
      address: 'Calle Eva Peron 5678, Buenos Aires'
    },
  ];

  for (const ownerData of owners) {
    await Owner.findOrCreate({ where: { documentNumber: ownerData.documentNumber }, defaults: ownerData });
  }
};
