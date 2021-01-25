const axios = require('axios');

const fetchColorFn = async () => {
  return await axios.get('./json/colors.json');
  // .then((res) => {
  //   return res;
  // })
  // .catch((err) => {
  //   console.log(err);
  // });
};

export { fetchColorFn };
