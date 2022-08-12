const client = require("../index.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, WebhookClient } = require("discord.js");
const fs = require('fs');
const log = new WebhookClient({ url: client.config.webhook });
const now = new Date();
const time = now.toLocaleString('THA', { timeZone: 'Asia/Bangkok' })

const price = 15 //ราคาของการสุ่มแต่ละรอบ
const rate = 15 //โอกาสออกรางวัลใหญ่

module.exports = {
    data: new SlashCommandBuilder()
        .setName("random")
        .setDescription("สุ่มของ"),
    async execute(client, interaction) {
        const acc_data = JSON.parse(fs.readFileSync('./db/acc.json', 'utf8'));
        const user_id = interaction.user.id;
        if (!acc_data[interaction.user.id]) return interaction.reply({ content: "คุณยังไม่มีบัญชีสมัครสมาชิก | /reg", ephemeral: true });
        if (acc_data[interaction.user.id].point < price) return interaction.reply({ content: `❌ | เงินไม่พอสุ่ม! ต้องการเงินอย่างน้อย ${price} บาท` });

        acc_data[interaction.user.id].point -= price
        fs.writeFileSync('./db/acc.json', JSON.stringify(acc_data, null, '\t'));

        let random = Math.random() * 100;
        random = Math.floor(random);

        if (random <= rate) {
            interaction.reply({ content: `คุณได้รางวัลใหญ่ ${random}% โปรดติดต่อ <@764758220858064906> เพื่อรับรางวัล` });
            const done = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(`> ✅ <@${user_id}> ได้รางวัลใหญ่ ${random}% \n> ⏰ วัน-เวลา \`${time}\` `)
            .setFooter(`${client.user.tag}`)
            log.send({
            content: 'มีคนได้รางวัลใหญ่',
            embeds: [done]
          })
        } else {
            interaction.reply({ content: `คุณเกลือ ${random}%` });
        };
    }
};