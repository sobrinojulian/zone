const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "help",
  aliases: ["h"],
  description: "🆘",
  execute(message) {
    let commands = message.client.commands.array();

    let helpEmbed = new MessageEmbed()
      .setTitle("☢️ DJ Zone")
      .setDescription("Lista de comandos")
      .setColor("#F8AA2A");

    commands = commands.filter((cmd) => cmd.name !== 'help')

    commands.forEach((cmd) => {
      helpEmbed.addField(
        `**${message.client.prefix}${cmd.name} ${cmd.aliases ? `(${cmd.aliases})` : ""}**`,
        `${cmd.description}`,
        true
      );
    });

    return message.channel.send(helpEmbed).catch(console.error);
  }
};
