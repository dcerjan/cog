let
  channels = {};

let publish = (channel, ...parameters) => {
  if(channels[channel]) {
    channels[channel].forEach( c => c(...parameters) );
  }
};

let subscribe = (channel, handler) => {
  if(!channels[channel]) {
    channels[channel] = [handler];
  } else {
    if(!channels[channel].some( hnd => hnd === handler )) {
      channels[channel].push(handler);
    } else {
      throw new Error("Unable to subscribe to channel '" + channel + "', same handler is already registered!");
    }
  }
};

let unsubscribe = (channel, handler) => {
  let i;

  if(!channels[channel]) {
    throw new Error("Channel '" + channel + "' does not exist!");
  } else {
    if(!channels[channel].some( hnd => hnd === handler )) {
      throw new Error("Unable to unsubscribe handler from channel '" + channel + "', handler was never registered!");
    } else {
      for(i = 0; i < channels[channel]; i++) {
        if(channels[channel][i] === handler) {
          channels[channel].splice(i, 1);
        }
      }
    }
  }
  if(!channels[channel].length) {
    delete channels[channel];
  }
};

export default { publish, subscribe, unsubscribe };
