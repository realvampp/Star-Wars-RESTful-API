import { Body, Controller, Post, Req, UseGuards, UsePipes, ValidationPipe, } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'
import { AuthService } from './auth.service'
import { CreateUserDto } from '../user/dto/create-user.dto'
import { Public } from './decorators/public.decorator'
import { User } from '../user/entities/user.entity'
import { RefreshRequestDto } from './dto/refresh-request.dto'

@ApiTags('auth')
@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiBody({type: CreateUserDto})
  @ApiOperation({summary: 'Login user'})
  async login(@Req() req: Request) {
    const user = req.user as User
    return await this.authService.login(user)
  }

  @UsePipes(new ValidationPipe())
  @Post('register')
  @ApiOperation({summary: 'Register user'})
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto)
  }

  @UsePipes(new ValidationPipe())
  @Post('refresh')
  @ApiOperation({summary: 'Refresh token'})
  async refresh(@Body() refreshToken: RefreshRequestDto) {

    return await this.authService.refreshToken(refreshToken.refreshToken)
  }
}
