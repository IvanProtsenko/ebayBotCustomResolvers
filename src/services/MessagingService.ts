import dotenv from 'dotenv';
import { RabbitRPCClient } from '@m10185/rabbit_rpc';
import { ConcoleLogger, ILogger } from '@m10185/mvp-logger';
import {
  EComandType,
  RequestMessage,
  ResponceMessage,
  RunData,
  StopData,
} from '@m10185/mvp-interfaces';
import { RequestMsg } from '../interfaces/Message';
import ResponseMsg from '../interfaces/ErrorResponse';
import { sleep } from './utils';

dotenv.config();

export class MessagingService {
  private logger: ILogger;

  private rpc_client!: RabbitRPCClient;

  private worker_mgr_queue: string = 'EBAY_DIALOG';

  constructor() {
    this.logger = new ConcoleLogger('WBB-Client');
    const rabbitUrl: string | undefined = process.env.RABBITMQ_URL;

    if (!rabbitUrl) {
      throw new Error('Rabbit url is empty');
    }

    this.rpc_client = new RabbitRPCClient(
      { amq_uri: rabbitUrl, rpc_queue: 'EBAY_DIALOG', prefetch: 1 },
      { logger: new ConcoleLogger('RabbitRPCClient'), timeout: 90 * 1000 }
    );
  }

  public async startUnkillable() {
    try {
      // this.logger.debug('Try create connection');
      await this.rpc_client.start();

      this.rpc_client.connectionOnError(async (err: any) => {
        const { message, stack } = err;
        // this.logger.debug('Connection error event catched', { meta: { message, stack } });
      });

      this.rpc_client.connectionOnClose(async () => {
        this.logger.warn('Connection close event catched. Sleep 10 sec & reconnect');
        await sleep(10000);
        await this.startUnkillable();
      });

      // this.logger.debug('Connection created successfully');
    } catch (error: any) {
      const { message, stack } = error;
      // this.logger.warn('Error catched. Sleep 20 sec & reconnect', { meta: { message, stack } });
      await sleep(20000);
      await this.startUnkillable();
    }
  }

  async sendMessage(
    message: string,
    conversationUrl: string
  ): Promise<ResponseMsg> {
    this.logger.log('sendMessage');
    const payload: RequestMsg = {
      message,
      conversationUrl,
    };

    const result = await this.request_msg_mgr_q(payload);
    return result;
  }

  private async request_msg_mgr_q(obj: any): Promise<any> {
    const str_msg = JSON.stringify(obj);
    try {
      console.log(str_msg);
      const server_resp = await this.rpc_client.request_msg(
        str_msg,
        this.worker_mgr_queue
      );

      const result = JSON.parse(server_resp);
      // const result = 'success';

      this.logger.log('result');
      this.logger.log(JSON.stringify(result));

      return result;
    } catch (error: any) {
      this.logger.error(error);
    }

    return null;
  }
}
