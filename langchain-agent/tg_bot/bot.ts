import * as dotenv from "dotenv";
import { Telegraf } from "telegraf";
// import filters
import { message, callbackQuery, channelPost } from 'telegraf/filters'
// import { message } from "./filters.js";
dotenv.config();

// need to expot

// const botToken = process.env.BOT_TOKEN || 'default_token' // Provide a default or handle error
const botToken = process.env.BOT_TOKEN;

if (!botToken) {
  console.error("No private key defined for the TG bot");
  process.exit(1); // Exit the program with error code
}
export const bot = new Telegraf(botToken);
// Remember, this should ideally be written before `bot.launch()`!

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN is not set");
}
// const bot = new Telegraf(process.env.BOT_TOKEN)
// Remember, this should ideally be written before `bot.launch()`!

bot.start((ctx) => {
  return ctx.reply(`Hello ${ctx.update.message.from.first_name}!`);
});

// TODO: ---->>> Default command, add more commands here

let command = "hipster";
bot.command(command, Telegraf.reply("λ"));
bot.on(message("sticker"), (ctx) => ctx.reply("Cool pic 👍"));

// TODO: ---->>> Default reply, add dynamic reply here
let reply =
  "Im a Starknet AI agent, but still not connected to my LLM brain, ok 👍";

bot.on(message(), (ctx) => ctx.reply(reply));
// bot.on(message('text'), async (ctx) => {
//   // Explicit usage
//   await ctx.telegram.sendMessage(ctx.message.chat.id, `Hello ${ctx.state.role}`)

//   // Using context shortcut
//   await ctx.reply(`Hello ${ctx.state.role}`)
// })

// Update the filter usage
// bot.on(message('text'), async (ctx) => {
//   await ctx.sendMessage('Hello!')
// })
bot.launch();

// bot.on(callbackQuery('data'), (ctx) => {
//   // Use ctx.callbackQuery.data
// })

// bot.on(channelPost('video'), (ctx) => {
//   // Use ctx.channelPost.video
// })
