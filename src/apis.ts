import axios from 'axios';

export const getVehicleInfo = async regNo => {
  return axios
    .get(
      `https://fly-eager-jawfish.ngrok-free.app/api/s2s/vehicle/details/${
        regNo
      }`,
    )
    .then(res => {
      return res?.data ?? {};
    });
};
