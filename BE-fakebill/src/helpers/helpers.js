import bcrypt from "bcrypt";

function generateHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(12), null);
}

export {
  generateHash
};
