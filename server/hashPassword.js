const bcrypt = require('bcryptjs');

async function generateHash(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);
  console.log('Hashed Password:', hashedPassword);
}

generateHash('reut1212');