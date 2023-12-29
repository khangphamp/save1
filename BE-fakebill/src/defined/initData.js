import User from "../models/User.js"
import { generateHash } from "../helpers/helpers.js";

async function initData() {
  try {
    const existUser = await User.exists();
    if (!existUser) {
      await new User({
        username: "admin",
        password: generateHash("123123"),
        permissions: ['DASHBOARD', 'BILLBANK'],
        role: 1
      }).save();
    }
  }
  catch (err) {
    console.log(err)
  }
}

export default initData;