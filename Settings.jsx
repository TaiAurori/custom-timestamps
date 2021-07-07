var settings;

const { React, getModuleByDisplayName } = require("powercord/webpack");
const { Category, TextInput, SwitchItem } = require("powercord/components/settings");
const FormItem = getModuleByDisplayName("FormItem", false);
const FormText = getModuleByDisplayName("FormText", false);

const dynamicdates = ["Today","Yesterday", "This Week", "Last Week", "This Month","Last Month","This Year", "Ancient"]

const vars = require("./modules/variables.js").variables;

module.exports = class Settings extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {}
    settings = this.props;
  }

  render() {
    return (
      <div>
        <TextInput
          note="Schematic that all message timestamps will follow. (see variables below)"
          defaultValue={settings.getSetting("timestampSchematic", "%Y-%0M-%0D %0h:%0m:%0s %AM")}
          onChange={(val) =>
            settings.updateSetting("timestampSchematic", val)
          }
        >
          Timestamp Schematic
        </TextInput>
        <TextInput
          note="Schematic that message timestamp bubbles (when you hover over a timestamp) will follow."
          defaultValue={settings.getSetting("timestampBubbleSchematic", "%W, %N %D, %Y %h:%0m %AM")}
          onChange={(val) =>
            settings.updateSetting("timestampBubbleSchematic", val)
          }
        >
          Timestamp Bubble Schematic
        </TextInput>
        <SwitchItem
          note="Whether the chat timestamp should be overwritten."
          value={settings.getSetting("enableChatTimestamp", true)}
          onChange={p=>{
            settings.toggleSetting('enableChatTimestamp', true)
          }}
        >Overwrite Chat Timestamp</SwitchItem>
        <SwitchItem
          note="Whether the hover timestamp should be overwritten."
          value={settings.getSetting("enableHoverTimestamp", true)}
          onChange={p=>{
            settings.toggleSetting('enableHoverTimestamp', true)
          }}
        >Overwrite Hover Timestamp</SwitchItem>
        {/* <TextInput
          note="Color of the timestamp. Any CSS color is valid."
          defaultValue={settings.getSetting("timestampColor", "var(--text-muted)")}
          onChange={(val) =>
            settings.updateSetting("timestampColor", val)
          }
        >
          Timestamp String
        </TextInput> */}
        <SwitchItem
          note="Change the timestamp schematic depending on how long ago the timestamp was."
          value={settings.getSetting("dynamicTimestamps", false)}
          onChange={p=>{
            settings.toggleSetting('dynamicTimestamps', false)
          }}
        >Dynamic Timestamps</SwitchItem> {/*disabled={!getSetting("dynamicTimestamps", false)}*/}
        <Category name="Dynamic Timestamps" opened={this.state.opened_dynamic} onChange={() => this.setState({ opened_dynamic: !this.state.opened_dynamic })}>
          {
          dynamicdates.map(element => {
            return <TextInput
              defaultValue={settings.getSetting("timestampDynamic" + element.split(" ").join(""), "%Y-%0M-%0D %0h:%0m:%0s %AM")}
              onChange={(val) =>
                settings.updateSetting("timestampDynamic" + element.split(" ").join(""), val)
              }
              disabled={!settings.getSetting("dynamicTimestamps", false)}
            >
              {element}
            </TextInput>
          })}
        </Category>
        <Category name="Variables" opened={this.state.category} onChange={() => this.setState({ category: !this.state.category })}>
        {vars.map(v => <FormItem style={{ marginBottom: "10px" }} title={<span style={{textTransform: "none"}}>{`%${v.selector}`}</span>}><FormText>{v.desc}</FormText></FormItem>)}
        </Category>
      </div>
    );
  }
};
