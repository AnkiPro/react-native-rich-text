export const RNBridge = `
class RNBridge {
  static IS_RN = !!window.ReactNativeWebView;
  static messageType = {
    MESSAGE: 'MESSAGE',
    REQUEST: 'REQUEST',
    CONSOLE: 'CONSOLE',
    EVENT: 'EVENT'
  }

  static send(data) {
    if (this.IS_RN) {
      window.ReactNativeWebView.postMessage(JSON.stringify(data));
    }
  }

  static console(data) {
    this.send({ type: RNBridge.messageType.CONSOLE, data});
  }

  static message(data) {
    this.send({ type: RNBridge.messageType.MESSAGE, data});
  }

  static request(request, data) {
    this.send({ type: RNBridge.messageType.REQUEST, request, data});
  }

  static event(event, data) {
    this.send({ type: RNBridge.messageType.EVENT, event, data});
  }

  static initListener() {
    function handleMessage(event) {
      const { actionType, formatType, eventType, requestType, data, options } = JSON.parse(event.data);
      if (actionType === 'FORMAT') {
        RNEditor.applyAction(formatType, options);
      }
      if (actionType === 'UNFORMAT') {
        RNEditor.cancelAction(formatType);
      }
      if (actionType === 'EVENT') {
        if (eventType === 'focus') {
          RNEditor.instance.commands.focus('end');
        }
        if (eventType === 'blur') {
          RNEditor.instance.commands.blur();
        }
        if (eventType === 'setContent') {
          RNEditor.instance.commands.setContent(data);
        }
      }
      if (actionType === 'MESSAGE') {
        RNBridge.message({state: RNEditor.prevState});
      }
      if (actionType === 'REQUEST') {
        if (requestType === 'is_active') {
          let isActive = RNEditor.instance.isActive(formatType, options);
          RNBridge.request(requestType, isActive);
        }
        if (requestType === 'get_attribute') {
          let attributes = RNEditor.instance.getAttributes(formatType);
          RNBridge.request(requestType, attributes);
        }
      }
    }

    // for iOS
    window.addEventListener('message', handleMessage, false);
    // for Android
    document.addEventListener('message', handleMessage, false);
  }
}
`;
