/* Copyright (C) 2020 TaiAurori (Gabriel Sylvain) - All Rights Reserved
 * You may use, distribute and modify this code under the
 * terms of the MIT license.
 * Basically, you can change and redistribute this code
 * but this copyright notice must remain unmodified.
 */

const { MoldSettings, req } = require("./modules/moldit.js");
let settings;

const { Plugin } = req("entities");
const { findInReactTree } = req("util");
const { inject, uninject } = req("injector");
const { getModule, getModuleByDisplayName } = req("webpack");
const tsmod = require("./modules/taistamps.js");
let moment;
let ts = new tsmod.Timestamper();
const dynamicdates = [
  {
    name: "Today",
    func: function(timestamp, moment) {return moment().startOf("day") < timestamp}
  },
  {
    name: "Yesterday",
    func: function(timestamp, moment) {return moment().subtract(1, "day").startOf("day") < timestamp}
  },
  {
    name: "This Week",
    func: function(timestamp, moment) {return moment().startOf("week") < timestamp}
  },
  {
    name: "Last Week",
    func: function(timestamp, moment) {return moment().subtract(1,"week").startOf("week") < timestamp}
  },
  {
    name: "This Month",
    func: function(timestamp, moment) {return moment().startOf("month") < timestamp}
  },
  {
    name: "Last Month",
    func: function(timestamp, moment) {return moment().subtract(1, "month").startOf("month") < timestamp}
  },
  {
    name: "This Year",
    func: function(timestamp, moment) {return moment().startOf("year") < timestamp}
  },
  {
    name: "Ancient",
    func: function(timestamp, moment) {return moment().startOf("year") > timestamp}
  }
]

const Settings = require("./Settings");

module.exports = class CustomTimestamps extends Plugin {
  startPlugin() {
    settings = new MoldSettings(this);
    settings.register({
      id: "custom-timestamps",
      label: "Custom Timestamps",
      render: Settings,
    });
    this.initInject();
  }

  async initInject() {
    moment = await getModule(["parseZone"])
    ts.moment = moment
    const timestampModule = await getModule(m => m.default?.displayName === "MessageTimestamp");
    inject(
      "message-timestamper",
      timestampModule,
      "default",
      (args, res) => {
        try {
          const timestampParsed = this.parseTimestamp(args[0].timestamp)
          res.props.children.props.text = this.parseTimestamp(args[0].timestamp, true);
          const { children } = res.props.children.props;
          res.props.children.props.children = e => {
            const r = children(e);
            if (r.props.children?.props?.className?.indexOf?.("edited") === 0) return r;
            r.props["aria-label"] = timestampParsed;
            r.props.children = timestampParsed;
            //r.props.style = { color: this.settings.get("timestampColor", "var(--text-muted)") };
            return r;
          }
          return res;
        } catch (err) {
          this.error("yay, something broke.\n", err)
          return res
        }
      }
    );
    timestampModule.default.displayName = "MessageTimestamp";
      //TODO: implement bubbles and message timestamps on welcome to server messages and grouped messages
//     inject("temp", Message, "default", (args, res) => {
//       if (res.props.children[0].props.children[1].props.compact) {
//         var ts = res.props.children[0].props.children[1].props.timestamp
//         res.props.children[0].props.children[1] = wp.React.createElement("span", {class: "latin24CompactTimeStamp-2V7XIQ timestamp-3ZCmNB timestampVisibleOnHover-2bQeI4 alt-1uNpEt"},wp.React.createElement("span", null, "Eggs!"));
//         res.props.children[0].props.children[1].props.timestamp = ts
//       }
//       return res
//     })
  }

  parseTimestamp(timestamp, bubble=false) {
    try {
      if (typeof timestamp != "object") throw new Error("Timestamp was not provided.");
      if (!timestamp["add"]) timestamp = moment(timestamp)
      let timestampParsed
      if (!bubble) {
        if (settings.get("dynamicTimestamps", false)) {
          var foundtimestamp = false;
          dynamicdates.forEach(element => {
            if (!foundtimestamp) {
              if (element.func(timestamp, moment)) {
                timestampParsed = ts.parseTimestamp(timestamp, settings.get("timestampDynamic" + element.name.split(" ").join(""), "%Y-%0M-%0D %0h:%0m:%0s %AM"));
                foundtimestamp = true
              }
            }
          });
          timestampParsed = foundtimestamp ? timestampParsed : "Something's wrong, I can feel it"
        } else {
          timestampParsed = ts.parseTimestamp(timestamp, settings.get("timestampSchematic", "%Y-%0M-%0D %0h:%0m:%0s %AM"));
        }
      } else {
        timestampParsed = ts.parseTimestamp(timestamp, settings.get("timestampBubbleSchematic", "%W, %N %D, %Y %h:%0m %AM"));
      }
      return timestampParsed
    } catch(err) {
      this.error("Timestamp parsing error: ",err)
      return "[timestamp parsing error]"
    }
  }

  pluginWillUnload() {
    settings.unregister("custom-timestamps");
    uninject("message-timestamper");
    uninject("message-timestamper2");
  };

  start() {this.startPlugin()}
  stop() {this.pluginWillUnload()}
};
