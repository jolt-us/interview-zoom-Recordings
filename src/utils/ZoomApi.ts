import fetch, { Response } from "node-fetch";
import { ZoomMeeting } from "../types/Zoom";
import buildUrl from "build-url";
import moment from "moment";
import {env} from "@jolt-us/env";
import {Meeting} from "../Entities/Meeting";
import {parse as parseUrl} from "querystring";

type Method = "GET" | "DELETE";
type QueryParams = { [name: string]: string | string[] }
const ZOOM_BASE_URL = env("ZOOM_BASE_URL","string", "https://api.zoom.us/v2/");

const ZOOM_MAX_PAGE_SIZE = 300;
const ONE_MONTH_AGO = moment().subtract(1,'month').valueOf();
export class ZoomApi {
  constructor(
      private readonly baseUrl: string,
      readonly fetch
  ) { }
  private request(path: string, method: Method = "GET", queryParams?: QueryParams): Promise<any> {
    const url = buildUrl(this.baseUrl, { path, queryParams });
    return this.fetch(url, {
      method,
      headers: {
        Authorization: "Bearer " + env("JWT_TOKEN", "string")
      }
    }).then((res: Response) => {
      if (res.status === 200) {
        return res.json()
      } else {
        return res.text().then(txt => ({error: true, body: txt}));
      }
    });
  }

  async getAccountRecordings(from: number = ONE_MONTH_AGO, to?: number): Promise<Meeting[]> {
    const accountId: string = "me";
    const queryParams: QueryParams = {
      page_size:  String(ZOOM_MAX_PAGE_SIZE),
      from: moment(from).format("YYYY-MM-DD"),
      to: to && moment(to).format("YYYY-MM-DD")
    };
    const meetings: ZoomMeeting[] = [];
    let res = await this.request(
        `/accounts/${accountId}/recordings`,
        "GET",
        queryParams

    );
    meetings.push(...res.meetings);
    while (meetings < res.total_records) {
      queryParams.next_page_token = res.next_page_token;
      res = await this.request(
          `/accounts/${accountId}/recordings`,
          "GET",
          queryParams

      );
      meetings.push(...res.meetings);
    }
    return meetings.map(meeting => new Meeting(meeting));
  }

  async deleteMeeting(meetingId: string): Promise<any> {
    const doubleEncodeId = encodeURIComponent(encodeURIComponent(meetingId));
    return await  this.request(
        `/meetings/${doubleEncodeId}/recordings`,
        "DELETE",
    );
  }

  static urlWithAccess(url: string): string {
    const token = env("JWT_TOKEN", "string");
    if ( parseUrl(url).access_token === token ) {
      return url;
    } else {
      return buildUrl(url, {
        queryParams: {
          access_token: token
        }
      });
    }
  }

}

export const zoomApi: ZoomApi = new ZoomApi(ZOOM_BASE_URL, fetch);