import bodyParser from "body-parser";
import express from "express";
import pkgJson from "./package.json";
import { uploadS3Meeting } from "./src/zoom2s3";
import { HouseKeeper } from "./src/HouseKeeper";
import {s3Utils} from "./src/utils/S3Utils";
import {zoomApi} from "./src/utils/ZoomApi";
import { env } from "@jolt-us/env";
import {Meeting} from "./src/Entities/Meeting";
import moment from "moment";
import {RpcServer} from "@jolt-us/jolt-rpc";
import {zoomRecordingRpcName} from "@jolt-us/jolt-zoom-recording-client";
import {ZoomRecordingService} from "./src/rpc-server/ZoomRecordingService";

const app = express();
app.use(bodyParser.json());

app.post("/onRecordingCompleteWebhook", async (req, res) => {
  const meeting: Meeting = getMeetingFromRequest(req.body);
  res.status(200);
  uploadS3Meeting(meeting).then(res => console.log("done uploading video"));
});

function getMeetingFromRequest(body: any): Meeting {
  return new Meeting(body.payload.object);
}
function weeksAgo(amount: number) {
  return moment().subtract(amount, "weeks");
}
const houseKeeper =  new HouseKeeper( s3Utils, zoomApi );


app.post(["/houseKeeper/save", "/houseKeeper/save/:from"], async (req, res) => {
  let from = req.params.from ? moment(req.params.from) : weeksAgo(3);
  const meetingsRecords = await zoomApi.getAccountRecordings(from.valueOf());
  console.log(meetingsRecords.length);
  
  houseKeeper.uploadMissingFilesFromZoomToS3(meetingsRecords)
      .then(amount => console.log(`houseKeeper done! saved ${amount} files `));
  res.status(200).json({});
});

app.post(["/houseKeeper/delete", "/houseKeeper/delete/:from", "/houseKeeper/delete/:from/:to"], async (req, res) => {
  let from = req.params.from ? moment(req.params.from) : weeksAgo(5);
  let to = req.params.to ? moment(req.params.to) : weeksAgo(2);
  const meetingsRecords = await zoomApi.getAccountRecordings(from.valueOf(), to.valueOf());

  houseKeeper.deleteCopiedMeetingsFromZoom(meetingsRecords).then(amount => console.log(`houseKeeper done! deleted ${amount}, meetings!`));
  res.status(200).json({});
});

app.get("/api/health", (req, res) => {
  const healthRes = {
    name: pkgJson.name,
    version: pkgJson.version
  };
  res.status(200).json(healthRes);
});

app.use(new RpcServer({
  onError: console.error,
  services: [
    {name: zoomRecordingRpcName, handler: new ZoomRecordingService(s3Utils)  }
  ]
}).middleware());

const port = env("PORT", "number");
app.listen(port, () => console.log(`listening on Port: ${port}`));
