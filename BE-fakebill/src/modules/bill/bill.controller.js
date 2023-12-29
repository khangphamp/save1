import { BankType } from "../../helpers/bankType.js";
import Users from "../../models/User.js"
import puppeteer from 'puppeteer'
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import fsExtra from 'fs-extra';

async function createBill(request, reply) {
    const file = request.body.file;
    try {
        const price = 0;
        const { _id: userId, money } = request.user.sub;
        if(Number(money) < price){
            return reply.notFound("Số dư không đủ")
        }
        const bank = BankType.find(item => item.id == request.params.id);
        
        if(!bank){
            return reply.notFound("Bank không tìm thấy")
        }
        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/google-chrome',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        // Mở trang web từ tệp HTML tạm thời và chờ trang tải hoàn tất
        await page.goto(`${process.env.DOMAIN}/assets/layoutBill/${bank.fileName}?${request.body.params}&avatar=${file?.filename2 || '../avatar/default.png'}`, { waitUntil: 'domcontentloaded' });
        
        const element = await page.waitForSelector("svg")
    
        // Chụp ảnh của trang
        const hash = uuidv4()
        if(!fs.existsSync(`src/assets/images`)){
            await fs.mkdir(`src/assets/images`, (err) => {
                if (err) {
                    return reply.notFound("Lỗi") 
                }})
            
        }
        const path =`src/assets/images/${hash}.png`;
        await element.screenshot({ path });

        // trừ tiền user
        await Users.findByIdAndUpdate(userId, {$inc : {'money' : price * -1}}, {new: true})

        let chromeTmpDataDir = null;
        let chromeSpawnArgs = browser.process().spawnargs;
      
        for (let i = 0; i < chromeSpawnArgs.length; i++) {
          if (chromeSpawnArgs[i].indexOf("--user-data-dir=") === 0) {
              chromeTmpDataDir = chromeSpawnArgs[i].replace("--user-data-dir=", "");
          }
        }
        await browser.close();
        if (chromeTmpDataDir !== null) {
          console.log(`Remove profile ${chromeTmpDataDir}`);
          fsExtra.removeSync(chromeTmpDataDir);
        }
      

        return reply.send({
            success: 1,
            message: "Mua thành công",
            data: {path}
        })
    }
    catch (err) {
        return reply.code(500).send({message: err.message})
    }
}
export default {
    createBill
}
