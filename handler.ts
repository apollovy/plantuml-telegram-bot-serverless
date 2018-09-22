import TelegramBot from 'node-telegram-bot-api';
import {APIGatewayEvent, Callback, Context, Handler} from 'aws-lambda';
import request from 'request';

const telegramToken: string = process.env['TELEGRAM_TOKEN'];
const telegramBot = new TelegramBot(telegramToken);

// This could be incorporated as a library call, but I want it this granular
const encoderURL: string = process.env['PLANTUML_ENCODER_URL'];
const rendererURL: string = process.env['PLANTUML_RENDERER_URL'];

export const messageHandler: Handler = (
    event: APIGatewayEvent, context: Context, cb: Callback
) => {
    console.log('Starting processing');
    const update = JSON.parse(event.body);
    const message = update.message ? update.message : update.edited_message;
    const text: string = message.text;
    const chatId: string = message.chat.id;
    console.log('Sending request to encoder');
    request(
        {
            url: encoderURL,
            method: "POST",
            body: text,
        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                const imageURL: string = rendererURL + '/' + body;
                console.log('Sending request to Telegram');
                telegramBot.sendPhoto(chatId, imageURL);
                const response = {
                    statusCode: 200,
                };
                cb(null, response);
                console.log('Finished processing');
            }
        }
    );
};
