export default class Dedupe {
  /**
   * Create a new instance of Dedupe
   * @return {void}
   */
  constructor() {
    this.previousEvent = null;
  }

  /**
   * Set the last event to check.
   *
   * @param {Event} event [description]
   */
  setLastEvent(event) {
    this.previousEvent = event;
  }

  /**
   * Clear the last event.
   * @return {void}
   */
  clearLastEvent() {
    this.previousEvent = null;
  }

  /**
   * Determine if the event is duplicate
   * by comparing group id
   * @param  {Event}  currentEvent
   * @return {Boolean}
   */
  isDuplicate(currentEvent) {
    if (!this.previousEvent) {
      return false;
    }

    return this.isSameEvent(currentEvent, this.previousEvent);
  }

  /**
   * Check if two events are equal by comparing group_id
   * @param  {Event}  currentEvent
   * @param  {Event}  previousEvent
   * @return {Boolean}
   */
  isSameEvent(currentEvent, previousEvent) {
    let currentGroup = currentEvent.group_id;
    let previousGroup = previousEvent.group_id;

    // if two events do not have group_id,
    // they are assumed to be different
    if (!currentGroup && !previousGroup) {
      return false;
    }

    if ((currentGroup && !previousGroup) || (!currentGroup && previousGroup)) {
      return false;
    }

    return currentGroup === previousGroup;
  }
}
