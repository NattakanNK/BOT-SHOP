const client = require("../index");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageSelectMenu, MessageActionRow, MessageButton, WebhookClient } = require('discord.js');
const fs = require('fs');
const log = new WebhookClient({ url: client.config.webhook });
const now = new Date();
const time = now.toLocaleString('THA', { timeZone: 'Asia/Bangkok' })

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('ซื้อสินค้าในร้านค้า'),
  async execute(client, interaction) {
    const user_id = interaction.user.id;
    const member = interaction.guild.members.cache.get(user_id);
    const stockdata = JSON.parse(fs.readFileSync("./db/stock.json", 'utf8'));
    const accdata = JSON.parse(fs.readFileSync("./db/acc.json", 'utf8'));


    const noreg = new MessageEmbed()
      .setColor(`RED`)
      .setDescription(`\`⚠️\` \`︱\`คุณยังไม่มีบัญชี กรุณาใช้คำสั่ง \`/register\` เพื่อสมัครสมาชิก`)

    if (!accdata[user_id]) return interaction.reply({ embeds: [noreg], ephemeral: true });

    const nostock = new MessageEmbed()
      .setColor("RED")
      .setDescription("\`❌\` \`︱\`ไม่มีรายการสินค้าในคลัง!")

    const nopro = new MessageEmbed()
      .setColor("RED")
      .setDescription("\`❌\` \`︱\`ของในคลังหมดกรุณารอแอดมินเพิ่มของ")


    if (Object.keys(stockdata).length == 0) return interaction.reply({ embeds: [nostock], ephemeral: true });
    const sort = Object.keys(stockdata).sort((a, b) => stockdata[a].price - stockdata[b].price);
    var page = 0;

    const eiei = new MessageSelectMenu()
      .setCustomId("buy-menu")
      .setPlaceholder("🛒 | เลือกสินค้าที่ต้องการ")
      .setOptions(sort.map((item, index) => {
        return {
          label: `${stockdata[item].name} | ราคา: ${stockdata[item].price} บาท | มีสินค้าคงเหลือ: ${stockdata[item].amout} ชิ้น`,
          value: `${item}`
        }
      }))
    const sel = new MessageActionRow()
      .addComponents(eiei)

    const backback = new MessageButton()
      .setCustomId("backback")
      .setLabel("◀◀")
      .setStyle("SUCCESS")

    const nextnext = new MessageButton()
      .setCustomId("nextnext")
      .setLabel("▶▶")
      .setStyle("SUCCESS")

    const back = new MessageButton()
      .setCustomId("back")
      .setLabel("◀")
      .setStyle("PRIMARY")

    const next = new MessageButton()
      .setCustomId("next")
      .setLabel("▶")
      .setStyle("PRIMARY")

    const ok = new MessageButton()
      .setCustomId("ok")
      .setLabel("ซื้อสินค้านี้")
      .setEmoji('993160028192264212')
      .setStyle("PRIMARY")

    const cancel = new MessageButton()
      .setCustomId("cel")
      .setLabel("ยกเลิก")
      .setEmoji("930750663812595712")
      .setStyle("DANGER")

    const okbuy = new MessageButton()
      .setCustomId("okbuy")
      .setLabel("ซื้อเลย")
      .setEmoji("930750613686485023")
      .setStyle("SUCCESS")

    const cancelbuy = new MessageButton()
      .setCustomId("celbuy")
      .setLabel("ยกเลิก")
      .setEmoji("930750663812595712")
      .setStyle("DANGER")

    const stupid = new MessageButton()
      .setCustomId("stupid")
      .setLabel("⛲")
      .setStyle("SECONDARY")

    const help = new MessageButton()
      .setCustomId("help")
      .setLabel("ช่วยเหลือ")
      .setEmoji("993156724716486757")
      .setStyle("PRIMARY")


    const row = new MessageActionRow()
      .addComponents(backback, back, next, nextnext)

    const rowbuy = new MessageActionRow()
      .addComponents(okbuy, stupid, cancelbuy)

    const row2 = new MessageActionRow()
      .addComponents(ok, cancel, help)

    const succesbuy = new MessageEmbed()
      .setColor("GREEN")
      .setTitle("Succes Buy!")
      .setDescription(`✅ | \`ซื้อสินค้าเรียบร้อย! | โปรดเช็คในแชทส่วนตัว!\``)
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp()


    const firstpage = new MessageEmbed()
      .setColor("8DE2FB")
      .setAuthor({ name: `${interaction.guild.name} | หน้า ${page}/${sort.length}`, iconURL: `${interaction.guild.iconURL()}` })
      .setTitle(`ยินดีต้อนรับสู่ร้าน ${interaction.guild.name}`)
      .setDescription(`> **สวัสดีครับ คุณ\` ${accdata[user_id].name}\` ( ยอดเงินคงเหลือ \`${accdata[user_id].point}\` บาท )**`)

      .setImage('https://cdn.discordapp.com/attachments/979779401401139220/993739176153448498/standard_3.gif')
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp()

    const msgdata = {
      embeds: [firstpage],
      components: [sel, row, row2],
      fetchReply: true,
      ephemeral: false
    }

    const msg = interaction.replied ? await interaction.followUp(msgdata) : await interaction.reply(msgdata);
    const filter = (interaction) => {
      if (interaction.user.id === user_id) return true;
      return interaction.reply({ content: "❌ | คุณไม่มีสิทธิ์ใช้งานปุ่มนี้!", ephemeral: true });
    }
    const col = msg.createMessageComponentCollector({
      filter,
      time: 300000
    });
    col.on('collect', async (i) => {
      i.deferUpdate();
      if (i.customId === "back") {
        if (page - 1 < 0) {
          page = sort.length - 1
        } else {
          page -= 1;
        }
      }
      if (i.customId === "next") {
        if (page + 1 == sort.length) {
          page = 0
        } else {
          page += 1;
        }
      }
      if (i.customId === "next") {
        sendEmbed()
      }
      if (i.customId === "back") {
        sendEmbed()
      }
      if (i.customId === "backback") {
        sendEmbed()
      }
      if (i.customId === "nextnext") {
        page = sort.length - 1;
        sendEmbed()
      }
      if (i.customId === "help") {
        helpembed()
      }
      if (i.customId === "ok") {
        if (!sort[page]) return interaction.reply({ embeds: [nostock] });
        wantbuy()
      }
      if (i.customId === "okbuy") {
        if (accdata[user_id].point < stockdata[sort[page]].price) return interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor("RED")
              .setDescription(`❌ | \`เงินของคุณไม่เพียงพอคุณมี ${accdata[user_id].point} บาท\``)
          ],
          components: []
        });
        if (stockdata[sort[page]].amout == 0) return interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor("RED")
              .setDescription(`❌ | \`สินค้าหมดสต็อกแล้วครับ!\``)
          ],
          components: []
        });
        if (stockdata[sort[page]].product.length === 0) return interaction.editReply({ embeds: [nopro], ephemeral: true, components: [] });
        accdata[user_id].point -= stockdata[sort[page]].price;
        fs.writeFileSync("./db/acc.json", JSON.stringify(accdata, null, 2));
        interaction.editReply({ embeds: [succesbuy], components: [] });
        const done = new MessageEmbed()
          .setColor("GREEN")
          .setTitle("✅ | ซื้อสินค้าสำเร็จ")
          .setDescription(`> 🏷️ ชื่อนาม-สกุล: \`${accdata[user_id].name} ${accdata[user_id].surname}\` \n> 👥 ผู้ใช้งาน: <@${user_id}> \n📅 วัน-เวลา: \`${time}\` \n📦 รายละเอียดสินค้า \n> **ชื่อสินค้า :** ${stockdata[sort[page]].name} \n> **รหัสสินค้า :** ${sort[page]} \n> **ราคา :** ${stockdata[sort[page]].price} ฿ \n> **คงเหลือ :** ${stockdata[sort[page]].amout} ชิ้น `)
          .setFooter({ text: `${member.user.tag}` })
          .setTimestamp();
        log.send({
          content: 'มีคนซื้อสินค้า',
          embeds: [done]
        })
        const dm = new MessageEmbed()
          .setColor("7FCDFF")
          .setTitle(`Order ${sort[page]} | สั่งซื้อ`)
          .setDescription(`1.) ${stockdata[sort[page]].name} \n> ||${stockdata[sort[page]].product[0]}|| \n\nขอบคุณที่ซื้อสินค้าครับ`)
          .setImage(stockdata[sort[page]].img)
          .setFooter({ text: `Requested by ${interaction.user.tag}` })
          .setTimestamp()
        interaction.user.send({ embeds: [dm] });
        if (stockdata[sort[page]].role) {
          member.roles.add(stockdata[sort[page]].role)
        }
        stockdata[sort[page]].amout -= 1;
        stockdata[sort[page]].product = stockdata[sort[page]].product.slice(1)
        fs.writeFileSync('./db/stock.json', JSON.stringify(stockdata, null, 2));
      }
      if (i.customId === "celbuy") {
        sendEmbed()
      }
      if (i.customId === "buy-menu") {
        sort.map((item, index) => {
          if (i.values[0] === item) {
            page = index;
            sendEmbed();
          }
        })
      }
      if (i.customId === "cel") {
        back.setDisabled(true),
          next.setDisabled(true),
          ok.setDisabled(true),
          cancel.setDisabled(true)
        eiei.setDisabled(true)
        nextnext.setDisabled(true)
        backback.setDisabled(true)
        help.setDisabled(true)
        sendEmbed()
      }
    });

    async function sendEmbed() {
      var embed = new MessageEmbed()
        .setColor("8DE2FB")
        .setTitle(`🛒 | คลังสินค้าของร้าน | ${page + 1}/${sort.length}`)
        .setDescription(`📦 รายละเอียดสินค้า \n> **ชื่อสินค้า :** ${stockdata[sort[page]].name} \n> **รหัสสินค้า :** ${sort[page]} \n> **ราคา :** ${stockdata[sort[page]].price} ฿ \n> **คงเหลือ :** ${stockdata[sort[page]].amout} ชิ้น \n\n⚠️︱คำเตือน : เปิด \`DM\`ก่อนจะกดซื้อ`)
        .setImage(stockdata[sort[page]].img)
        .setFooter({ text: `Requested by ${interaction.user.tag}` })
        .setTimestamp()
      interaction.editReply({ embeds: [embed], components: [sel, row, row2] });
    }

    async function helpembed() {
      var embed = new MessageEmbed()
        .setColor("FFD35A")
        .setTitle('**วิธีซื้อของ |  💳**\n\`‼ คำเตือน กรุณาเปิด DM ก่อนซื้อสินค้า ‼\`')
        .setDescription('1. เติมเงินผ่านอังเปา | คำสั่ง \`/topup\` \n2. เลือกสินค้าโดยการกดปุ่ม\` ◀ ไปซ้าย | ▶ ไปขวา \`   \`◀◀ ไปซ้ายสุด | ▶▶ ไปขวาสุด\` \n3. ซื้อสินค้าโดยการกดปุ่ม \`🛒\` แล้วกด \`ตกลง\` เพื่อยืนยันการซื้อ\n4. บอทจะตรวจสอบข้อมูลแล้วจะ ส่งข้อมูลสินค้าไปทาง \`DM\`')
        .setTimestamp()
      interaction.editReply({ embeds: [embed], components: [sel, row, row2] });

    }

    async function test() {

      var firstpage = new MessageEmbed()
        .setColor("8DE2FB")
      .setAuthor({ name: `${interaction.guild.name} | หน้า ${page}/${sort.length}`, iconURL: `${interaction.guild.iconURL()}` })
      .setTitle(`ยินดีต้อนรับสู่ร้าน ${interaction.guild.name}`)
      .setDescription(`> **สวัสดีครับ คุณ\` ${accdata[user_id].name}\` ( ยอดเงินคงเหลือ \`${accdata[user_id].point}\` บาท )**`)

      .setImage('https://cdn.discordapp.com/attachments/979779401401139220/993739176153448498/standard_3.gif')
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp()

      var msgdata = {
        embeds: [firstpage],
        components: [sel, row, row2],
        fetchReply: true,
        ephemeral: false
      }

    
      var msg = interaction.replied ? await interaction.followUp(msgdata) : await interaction.reply(msgdata);
      var filter = (interaction) => {
        if (interaction.user.id === user_id) return true;
        return interaction.reply({ content: "❌ | คุณไม่มีสิทธิ์ใช้งานปุ่มนี้!", ephemeral: true });
      }
      var col = msg.createMessageComponentCollector({
        filter,
        time: 300000
      });
      col.on('collect', async (i) => {
        i.deferUpdate();
        if (i.customId === "back") {
          if (page - 1 < 0) {
            page = sort.length - 1
          } else {
            page -= 1;
          }
        }
        if (i.customId === "next") {
          if (page + 1 == sort.length) {
            page = 0
          } else {
            page += 1;
          }
        }
        if (i.customId === "next") {
          sendEmbed()
        }
        if (i.customId === "back") {
          sendEmbed()
        }
        if (i.customId === "backback") {
          sendEmbed()
        }
        if (i.customId === "nextnext") {
          page = sort.length - 1;
          sendEmbed()
        }
        if (i.customId === "help") {
          helpembed()
        }
        if (i.customId === "ok") {
          if (!sort[page]) return interaction.reply({ embeds: [nostock] });
          wantbuy()
        }
        if (i.customId === "okbuy") {
          if (accdata[user_id].point < stockdata[sort[page]].price) return interaction.editReply({
            embeds: [
              new MessageEmbed()
                .setColor("RED")
                .setDescription(`❌ | \`เงินของคุณไม่เพียงพอคุณมี ${accdata[user_id].point} บาท\``)
            ],
            components: []
          });
          if (stockdata[sort[page]].amout == 0) return interaction.editReply({
            embeds: [
              new MessageEmbed()
                .setColor("RED")
                .setDescription(`❌ | \`สินค้าหมดสต็อกแล้วครับ!\``)
            ],
            components: []
          });
          accdata[user_id].point -= stockdata[sort[page]].price;
          fs.writeFileSync("./db/acc.json", JSON.stringify(accdata, null, 2));
          interaction.editReply({ embeds: [succesbuy], components: [] });
          const dm = new MessageEmbed()
            .setColor("7FCDFF")
            .setTitle(`Order ${sort[page]} | สั่งซื้อ`)
            .setDescription(`1.) ${stockdata[sort[page]].name} \n> ||${stockdata[sort[page]].product}|| \n\n❕❕**หาซื้อนค้าไปที่เป็นโค้ด ห้ามใช้ในเชิงพานิชญ์ และ ห้ามเผยแพร่ลิงค์สินค้านี้กับใคร**`)
            .setImage(stockdata[sort[page]].img)
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp()
          interaction.user.send({ embeds: [dm] });
          stockdata[sort[page]].amout -= 1;
          fs.writeFileSync("./db/stock.json", JSON.stringify(stockdata, null, 2));
        }
        if (i.customId === "celbuy") {
          sendEmbed()
        }
        if (i.customId === "buy-menu") {
          sort.map((item, index) => {
            if (i.values[0] === item) {
              page = index;
              sendEmbed();
            }
          })
        }
        if (i.customId === "cel") {
          back.setDisabled(true),
            next.setDisabled(true),
            ok.setDisabled(true),
            cancel.setDisabled(true)
          eiei.setDisabled(true)
          nextnext.setDisabled(true)
          backback.setDisabled(true)
          sendEmbed()
        }
      });


    }

    async function wantbuy() {
      var embed = new MessageEmbed()
        .setColor("8DE2FB")
        .setTitle(`🛒 | คลังสินค้าของร้าน | ${page + 1}/${sort.length}`)
        .setDescription(`📦 รายละเอียดสินค้า \n> **ชื่อสินค้า :** ${stockdata[sort[page]].name} \n> **รหัสสินค้า :** ${sort[page]} \n> **ราคา :** ${stockdata[sort[page]].price} ฿ \n> **คงเหลือ :** ${stockdata[sort[page]].amout} ชิ้น \n\n⚠️︱คำเตือน : เปิด \`DM\`ก่อนจะกดซื้อ`)
        .setImage(stockdata[sort[page]].img)
        .setFooter({ text: `Requested by ${interaction.user.tag}` })
        .setTimestamp()
      interaction.editReply({ embeds: [embed], components: [rowbuy] });
    }
  }
}