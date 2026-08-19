import clienteAxios from '../api/axios';

export const creditoPublicService = {

  consultar: async (token) => {

    const response =
      await clienteAxios.get(
        `/public/credito/${token}`
      );

    return response.data.data;
  }

};