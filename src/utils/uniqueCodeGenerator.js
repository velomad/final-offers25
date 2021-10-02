const codeGen = (model) => {
  return new Promise(async (resolve, reject) => {
    const uniqueCode = generatCode();
    const find = await model.findOne({
      where: {
        uniqueCode,
      },
    });

    if (!find) {
      resolve(uniqueCode);
    } else {
      codeGen(model);
    }
  });
};

const generatCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

module.exports = { codeGen };
