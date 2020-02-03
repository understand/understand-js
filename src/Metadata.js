export default class Metadata {
  /**
   * Applies metadata to the event.
   * @param  {event} Event
   * @param  {Object} metadata
   * @return {event}
   */
  static applyToEvent(event, metadata) {
    try {
      event = Object.assign(event, {
        context: JSON.parse(JSON.stringify(metadata))
      });
    } catch (e) {
      event = Object.assign(event, { context: {} });
    }

    return event;
  }
}
