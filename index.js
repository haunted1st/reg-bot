require('dotenv').config();
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('✅ Бот работает'));
app.listen(3000, () => console.log('🌐 Express сервер запущен на порту 3000'));

// == Импорты ==
const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  InteractionType,
  PermissionsBitField,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
  Events
} = require('discord.js');

const dayjs = require('dayjs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const COLOR_TRIGGER_CHANNEL_ID = '1389223369664237779';
const POST_CHANNEL_ID = '1389224345963860058';
const TRIGGER_WORD = 'open';

const NEXT_COLOR = {
  'Бежевый': 'Чёрный',
  'Чёрный': 'Голубой',
  'Голубой': 'Фиолетовый',
  'Фиолетовый': 'Серый',
  'Серый': 'Бежевый'
};

const COLOR_IMAGES = {
  'Бежевый': 'https://media.discordapp.net/attachments/1346888993798619347/1347185611202629693/5FBA3B74-5A9B-4A5A-8FDA-4E325D1A738A.png',
  'Серый': 'https://media.discordapp.net/attachments/1346888993798619347/1347185506152087633/E022BBBC-9673-4D8A-9019-4C026691F56F.png',
  'Чёрный': 'https://media.discordapp.net/attachments/1346888993798619347/1347185234097078285/FEDB35ED-C3D9-4CEB-AFD5-5753DF1B7C93.png',
  'Голубой': 'https://media.discordapp.net/attachments/1346888993798619347/1347185794439315546/8FE0E4BA-447A-4885-808A-6F37995F2DE4.png',
  'Фиолетовый': 'https://media.discordapp.net/attachments/1346888993798619347/1347186061129945258/865F7178-5E2A-4D32-93CF-AEE24E98130D.png'
};

let usedColors = [];

function getNextAvailableColor(startColor) {
  let current = NEXT_COLOR[startColor];
  const checked = new Set();

  while (!checked.has(current)) {
    checked.add(current);
    if (!usedColors.includes(current)) return current;
    current = NEXT_COLOR[current];
  }

  return null;
}

client.once('ready', () => {
  console.log(`🤖 Бот запущен как ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const trigger = message.content.trim();

  if (trigger.toLowerCase() === TRIGGER_WORD) {
    try {
      const channel = await client.channels.fetch(COLOR_TRIGGER_CHANNEL_ID);
      if (channel && channel.type === ChannelType.GuildText) {
        await channel.send(`Garcia\nСерый`);
        console.log('✅ Сообщение Garcia\nСерый отправлено');
      }
    } catch (err) {
      console.error('❌ Ошибка при отправке сообщения Open:', err);
    }
    return;
  }

  const nextColor = getNextAvailableColor(trigger);
  if (!nextColor) {
    console.log('❗ Все цвета уже использованы.');
    return;
  }

  const imageUrl = COLOR_IMAGES[nextColor];
  if (!imageUrl) {
    console.error(`❌ Нет изображения для цвета ${nextColor}`);
    return;
  }

  try {
    const logChannel = await client.channels.fetch(COLOR_TRIGGER_CHANNEL_ID);
    if (logChannel && logChannel.type === ChannelType.GuildText) {
      await logChannel.send(`регистрация прошла\nЦвет: ${nextColor}`);
    }

    const targetChannel = await client.channels.fetch(POST_CHANNEL_ID);
    if (!targetChannel || targetChannel.type !== ChannelType.GuildText) return;

    const regMsg = await targetChannel.send({
      content: `регистрация прошла\nЦвет: ${nextColor}`,
      files: [imageUrl]
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const threadTitle = tomorrow.toLocaleDateString('ru-RU');

    await regMsg.startThread({
      name: threadTitle,
      autoArchiveDuration: 60
    });

    usedColors.push(nextColor);
    console.log(`✅ Зарегистрирован: ${nextColor}`);
  } catch (err) {
    console.error('❌ Ошибка при выполнении:', err);
  }
});

client.login(process.env.TOKEN); 1

