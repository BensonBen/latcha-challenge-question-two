import {green, bgRed} from 'chalk';
import {Request, Response} from 'express';
import {OK, UNAUTHORIZED} from 'http-status';
import {singleton} from 'tsyringe';
@singleton()
export class AuthController {
  private readonly logger = console.log;

  public async authenticate(
    {body}: Request,
    response: Response
  ): Promise<Response<any>> {
    // const {email, password} = body;
    const serverResponse = response.status(UNAUTHORIZED);
    try {
      // find the user in the database?
      // const user =

      // do the passwords match?
      // const matchPasswords =

      // generate secure token.
      const token = '034166ee-d4ba-43aa-8804-2d6c0b0ecfbe';

      // you really shouldn't be logging this, but just for these purposes.
      this.logger(green(`[Server] Created a token: ${token}`));
      serverResponse.append('data', token);
      serverResponse.status(OK);
    } catch (error: any) {
      // return a reponse as appropriate to indicate error.

      this.logger(bgRed(`UnAuthorized Access: ${error}`));
      serverResponse.append('error', error);
    }

    return serverResponse.send();
  }
}
