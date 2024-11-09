"use strict";

export const message = function () {
    var keys = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        keys[_i] = arguments[_i];
    }
    return function (update) {
        if (!('message' in update))
            return false;
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            if (!(key in update.message))
                return false;
        }
        return true;
    };
};

export const editedMessage = function () {
    var keys = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        keys[_i] = arguments[_i];
    }
    return function (update) {
        if (!('edited_message' in update))
            return false;
        for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
            var key = keys_2[_i];
            if (!(key in update.edited_message))
                return false;
        }
        return true;
    };
};

export const channelPost = function () {
    var keys = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        keys[_i] = arguments[_i];
    }
    return function (update) {
        if (!('channel_post' in update))
            return false;
        for (var _i = 0, keys_3 = keys; _i < keys_3.length; _i++) {
            var key = keys_3[_i];
            if (!(key in update.channel_post))
                return false;
        }
        return true;
    };
};

export const editedChannelPost = function () {
    var keys = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        keys[_i] = arguments[_i];
    }
    return function (update) {
        if (!('edited_channel_post' in update))
            return false;
        for (var _i = 0, keys_4 = keys; _i < keys_4.length; _i++) {
            var key = keys_4[_i];
            if (!(key in update.edited_channel_post))
                return false;
        }
        return true;
    };
};

export const callbackQuery = function () {
    var keys = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        keys[_i] = arguments[_i];
    }
    return function (update) {
        if (!('callback_query' in update))
            return false;
        for (var _i = 0, keys_5 = keys; _i < keys_5.length; _i++) {
            var key = keys_5[_i];
            if (!(key in update.callback_query))
                return false;
        }
        return true;
    };
};

/** Any of the provided filters must match */
export const anyOf = function () {
    var filters = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        filters[_i] = arguments[_i];
    }
    return function (update) {
        for (var _i = 0, filters_1 = filters; _i < filters_1.length; _i++) {
            var filter = filters_1[_i];
            if (filter(update))
                return true;
        }
        return false;
    };
};

/** All of the provided filters must match */
export const allOf = function () {
    var filters = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        filters[_i] = arguments[_i];
    }
    return function (update) {
        for (var _i = 0, filters_2 = filters; _i < filters_2.length; _i++) {
            var filter = filters_2[_i];
            if (!filter(update))
                return false;
        }
        return true;
    };
};
