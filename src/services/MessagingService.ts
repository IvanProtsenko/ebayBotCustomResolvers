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

dotenv.config();

export class MessagingService {
  private logger: ILogger;

  private rpc_client!: RabbitRPCClient;

  private worker_mgr_queue: string = 'EBAY_DIALOG';

  constructor() {
    this.logger = new ConcoleLogger('WBB-Client');
  }

  public async start() {
    const rabbitUrl: string | undefined = process.env.RABBITMQ_URL;

    if (!rabbitUrl) {
      throw new Error('Rabbit url is empty');
    }

    this.rpc_client = new RabbitRPCClient(
      { amq_uri: rabbitUrl, rpc_queue: '', prefetch: 1 },
      { logger: new ConcoleLogger('RabbitRPCClient'), timeout: 12 * 1000 }
    );
    await this.rpc_client.start();
  }

  async sendMessage(
    message: string,
    conversationUrl: string
  ): Promise<ResponceMessage> {
    this.logger.log('sendMessage');
    const payload: RequestMsg = {
      message,
      conversationUrl,
    };

    const result = await this.request_msg_mgr_q(payload);
    return result;
  }

  async run_app(
    name: string,
    profile_email: string,
    args: any
  ): Promise<ResponceMessage> {
    this.logger.log('run_app');
    const payload: RunData = {
      name,
      profile_email,
      args,
    };

    const msg: RequestMessage = {
      command: EComandType.RUN_APP,
      payload,
    };

    const result = await this.request_msg_mgr_q(msg);
    return result;
  }

  async stop_app(
    name: string,
    profile_email: string
  ): Promise<ResponceMessage> {
    this.logger.log('kill_by_profile');

    const payload: StopData = {
      profile_email,
      name,
    };

    const msg: RequestMessage = {
      command: EComandType.STOP_APP,
      payload: {
        profile_email,
      } as StopData,
    };
    const result = await this.request_msg_mgr_q(msg);

    return result;
  }

  private async request_msg_mgr_q(obj: any): Promise<any> {
    const str_msg = JSON.stringify(obj);
    try {
      console.log(str_msg);
      console.log(this.worker_mgr_queue);
      // const server_resp = await this.rpc_client.request_msg(
      //   str_msg,
      //   this.worker_mgr_queue
      // );

      // const result = JSON.parse(server_resp);
      const result = 'success';

      this.logger.log('result');
      this.logger.log(JSON.stringify(result));

      return result;
    } catch (error: any) {
      this.logger.error(error);
    }

    return null;
  }
}
