import ErrorResponse from '../interfaces/ErrorResponse';
import { RequestMsg } from '../interfaces/Message';
import dotenv from 'dotenv';

dotenv.config();

export async function sendMessageRequest(sendData: RequestMsg) {
  try {
    const response = await fetch(process.env.SENDER_URL + '/send', {
      method: 'POST',
      body: JSON.stringify(sendData),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    const result = (await response.json()) as ErrorResponse;

    console.log('result is: ', JSON.stringify(result));

    return result;
  } catch (error) {
    if (error instanceof Error) {
      console.log('error message: ', error.message);
      return error.message;
    } else {
      console.log('unexpected error: ', error);
      return 'An unexpected error occurred';
    }
  }
}
