import { Injectable } from '@nestjs/common';

import { GeneralSettingsService } from '../general_settings.service';

@Injectable()
export class GeneralSettingsExtendedService extends GeneralSettingsService {

  getGeneralSettings = async (inputParams, reqObject) => {
    // inputParams.type = admin/mobile/web - we can keep condition based on type
    const panelTitle = await this.general.getConfigItem('CPANEL_TITLE');
    const companyAddress = await this.general.getConfigItem("COMPANY_ADDRESS");
    const companyPhoneNumber = await this.general.getConfigItem("COMPANY_PHONE_NUMBER");
    const companyFacebookURL = await this.general.getConfigItem("COMPANY_FACEBOOK_URL");
    const companyInstagramURL = await this.general.getConfigItem("COMPANY_INSTAGRAM_URL");
    const companyTwitterURL = await this.general.getConfigItem("COMPANY_TWITTER_URL");
    const companyYoutubeURL = await this.general.getConfigItem("COMPANY_YOUTUBE_URL");
    const appleStoreURL = await this.general.getConfigItem("IOS_APP_STORE_URL");
    const playStoreURL = await this.general.getConfigItem("ANDROID_PLAY_STORE_URL");
    const autoRefreshTime = await this.general.getConfigItem('AUTO_REFRESH_MINUTES');
  
    const currYear = new Date().getFullYear();
    const companyName = await this.general.getConfigItem('COMPANY_NAME');
    let copyRightedText = await this.general.getConfigItem("COPYRIGHTED_TEXT");
    copyRightedText = copyRightedText.replace('#COMPANY_NAME#',companyName);
    copyRightedText = copyRightedText.replace('#CURRENT_YEAR#', currYear);
  
    return {
      company_address: companyAddress,
      company_phone_number: companyPhoneNumber,
      company_facebook_url: companyFacebookURL,
      company_instagram_url: companyInstagramURL,
      company_twitter_url: companyTwitterURL,
      company_youtube_url: companyYoutubeURL,
      apple_store_url: appleStoreURL,
      play_store_url: playStoreURL,
      copyrighted_text: copyRightedText,
      panel_title: panelTitle,
      auto_refresh_time: autoRefreshTime,
    };
  };
}