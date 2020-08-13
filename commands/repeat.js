const { canModifyQueue } = require("../util/EvobotUtil");

module.exports = {
  name: "repeat",
  description: "🔂",
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.reply("There is nothing playing.").catch(console.error);
    if (!canModifyQueue(message.member)) return;

    // toggle from false to true and reverse
    queue.repeat = !queue.repeat;
    return queue.textChannel
      .send(`Repetir esta ${queue.repeat ? "**activado**" : "**desactivado**"}`)
      .catch(console.error);
  }
};
