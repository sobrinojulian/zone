const { play } = require("../include/play");
const { YOUTUBE_API_KEY, PLAYLIST, MAX_PLAYLIST_SIZE } = require("../config.json");
const YouTubeAPI = require("simple-youtube-api");
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);

module.exports = {
  name: "play",
  cooldown: 3,
  aliases: [""],
  description: "▶️",
  async execute(message, args) {
    const { channel } = message.member.voice;

    // Validate user channel
    const serverQueue = message.client.queue.get(message.guild.id);
    if (!channel) return message.reply("You need to join a voice channel first!").catch(console.error);
    if (serverQueue && channel !== message.guild.me.voice.channel)
      return message.reply(`You must be in the same channel as ${message.client.user}`).catch(console.error);

    // Validate command arguments
    if (args.length !== 0) return message.reply(`Usage: ${message.client.prefix}play`).catch(console.error);

    // Validate bot permissions
    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))
      return message.reply("Cannot connect to voice channel, missing permissions");
    if (!permissions.has("SPEAK"))
      return message.reply("I cannot speak in this voice channel, make sure I have the proper permissions!");

    // Validate playlist pattern
    const url = PLAYLIST;
    const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
    if (!playlistPattern.test(url)) return message.reply("Invalid playlist pattern").catch(console.error);

    // Create Queue
    const queueConstruct = {
      textChannel: message.channel,
      channel,
      connection: null,
      songs: [],
      loop: true,
      repeat: false,
      volume: 100,
      playing: true
    };

    let song = null;
    let playlist = null;
    let videos = [];

    // Try to get playlist
    try {
      playlist = await youtube.getPlaylist(url, { part: "snippet" });
      videos = await playlist.getVideos(MAX_PLAYLIST_SIZE || 10, { part: "snippet" });
    } catch (error) {
      console.error(error);
      return message.reply("Playlist not found :(").catch(console.error);
    }

    // Shuffle videos
    for (let i = videos.length - 1; i > 1; i--) {
      let j = 0 + Math.floor(Math.random() * i);
      [videos[i], videos[j]] = [videos[j], videos[i]];
    }

    // Add songs to Queue
    videos.forEach((video) => {
      song = {
        title: video.title,
        url: video.url,
        duration: video.durationSeconds
      };

      if (serverQueue) {
        serverQueue.songs.push(song);
      } else {
        queueConstruct.songs.push(song);
      }
    });

    //
    if (!serverQueue) message.client.queue.set(message.guild.id, queueConstruct);

    if (!serverQueue) {
      try {
        queueConstruct.connection = await channel.join();
        await queueConstruct.connection.voice.setSelfDeaf(true);
        play(queueConstruct.songs[0], message);
      } catch (error) {
        console.error(error);
        message.client.queue.delete(message.guild.id);
        await channel.leave();
        return message.channel.send(`Could not join the channel: ${error}`).catch(console.error);
      }
    }
  }
};
