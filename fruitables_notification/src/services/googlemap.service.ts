import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GoogleMapService {
  private readonly apiKey: string;
  private readonly googleBaseUrl: string;
  protected geocoing: boolean;
  protected directions: boolean;
  protected reverse_geocoding: boolean;

  constructor() {
    this.apiKey = 'AIzaSyDGhGk3DTCkjF1EUxpMm5ypFoQ-ecrS2gY';
    this.googleBaseUrl = 'https://maps.googleapis.com/maps/api/';

    this.geocoing = false;
    this.directions = false;
    this.reverse_geocoding = false;
  }

  async geocodeAddress(address: string) {
    let result: any = {};
    try {
      console.log(address);
      const response = await axios.get(this.googleBaseUrl + 'geocode/json', {
        params: {
          address: address,
          key: this.apiKey,
        },
      });

      const { data } = response;
      if (data.results && data.results.length > 0) {
        result = data.results[0];
      } else {
        result = {};
      }
    } catch (error) {
      result = {};
    }
    return result;
  }

  async getDirections(origin: string, destination: string) {
    let result: any = {};
    try {
      const response = await axios.get(this.googleBaseUrl + 'directions/json', {
        params: {
          origin: origin,
          destination: destination,
          key: this.apiKey,
        },
      });

      const { data } = response;
      if (data.routes && data.routes.length > 0) {
        result = data.routes[0];
      } else {
        result = {};
      }
    } catch (error) {
      result = {};
    }

    return result;
  }

  async getReverseGeoCoding(lat: string, lng: string) {
    let result: any = {};
    try {
      const response = await axios.get(this.googleBaseUrl + 'geocode/json', {
        params: {
          latlng: `${lat},${lng}`,
          key: this.apiKey,
        },
      });

      const { data } = response;

      if (data.results && data.results.length > 0) {
        result = data.results;
      } else {
        result = {};
      }
    } catch (error) {
      result = {};
    }

    return result;
  }
}
