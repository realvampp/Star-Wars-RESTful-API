import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ImagesService } from './images.service'
import { CreateImageDto } from './dto/create-image.dto'
import { createUrlByIdAndClass } from '../utils'
import { Imagable } from '../types/imagable.type'
import { S3Service } from '../s3/s3.service'
import { NeedAdmin } from '../auth/decorators/needAdmin.decorator'

@Controller('images')
@ApiBearerAuth()
@NeedAdmin(true)
@ApiTags('images')
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService,
    private readonly s3Service: S3Service,
  ) {}

  // @NeedAdmin(false)
  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   const image = await this.imagesService.findOne(+id)
  //   const buffer = await this.s3Service.getFile(image.link)
  //   console.log(buffer)
  //   return { image /*buffer*/ }
  // }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete image by id' })
  async remove(@Param('id') id: string) {
    const removed = await this.imagesService.remove(+id)
    await this.s3Service.deleteFile(removed.link)
    return removed
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Upload images' })
  @ApiBody({
    description: 'images',
    type: CreateImageDto,
  })
  async upload(
    @Body('id') id: string,
    @Body('className') className: Imagable,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (files.length === 0) {
      throw new BadRequestException('No files uploaded')
    }

    const entityUrl = createUrlByIdAndClass(className, id)

    for (const file of files) {
      const awsName = await this.s3Service.uploadFile(file)

      await this.imagesService.create(className, entityUrl, awsName)
    }

    return { success: true }
  }
}
