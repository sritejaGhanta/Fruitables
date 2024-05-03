import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// import { SESClient } from '@aws-sdk/client-ses';
import { SettingEntity } from 'src/entities/setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SettingEntity]),
    MailerModule.forRootAsync({
      imports: [TypeOrmModule.forFeature([SettingEntity])],
      inject: [getRepositoryToken(SettingEntity)],
      useFactory: async (settingEntityRepo: Repository<SettingEntity>) => {
        const queryObject = settingEntityRepo.createQueryBuilder('ms');

        queryObject.select('ms.name', 'name');
        queryObject.addSelect('ms.value', 'value');
        queryObject.where('ms.name IN (:...configType)', {
          configType: [
            'COMPANY_SUPPORT_EMAIL',
            'USE_SMTP_SERVERHOST',
            'USE_SMTP_SERVERPASS',
            'USE_SMTP_SERVERPORT',
            'USE_SMTP_SERVERUSERNAME',
            'COMPANY_NAME',
            'USE_SMTP_SERVERTYPE',
          ],
        });

        const data: any = await queryObject.getRawMany();

        const config: { [key: string]: string } = {};
        data.forEach((setting) => {
          config[setting.name] = setting.value;
        });

        const params = {
          host: config.USE_SMTP_SERVERHOST,
          port: Number(config.USE_SMTP_SERVERPORT),
          secure: true,
          auth: {
            user: config.USE_SMTP_SERVERUSERNAME,
            pass: config.USE_SMTP_SERVERPASS,
          },
        };

        return {
          transport: params,

          // transport: {
          //   SES: {
          //     ses: new SESClient({
          //       apiVersion: '2012-10-17',
          //       region: 'ap-south-1',
          //       credentials: {
          //         accessKeyId: 'AKIA5SCQE4IDDGS5NRWR',
          //         secretAccessKey:
          //           'BO9QSM++lBGHf6MYxwtm\\/tZZmhX9aAdDokLx8OME3c5s',
          //       },
          //     }),
          //   },
          // },
          defaults: {
            from:
              '"' +
              config.COMPANY_NAME +
              '" <' +
              config.COMPANY_SUPPORT_EMAIL +
              '>',
          },
          template: {
            dir: 'src/views/',
            adapter: new EjsAdapter(),
          },
        };
      },
    }),
  ],
})
export class MailerModuleWrapper {}
