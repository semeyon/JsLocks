var Locker = function () {};
Locker.locks = {};
Locker._lockQueue = {};
Locker._runningQueue = {};

Locker._wait = function (obj) {
    Locker._runningQueue[obj] = true;
    var isLocked = Locker.locks[obj];
    if (!isLocked) {
        Locker.locks[obj] = true;
        var _callback = Locker._lockQueue[obj].shift();
        if (_callback === undefined) {
            Locker.locks[obj] = false;
            Locker._runningQueue[obj] = false;
            return;
        }
        _callback[0].call(this);
        Locker.locks[obj] = false;
    }
    setTimeout(function () { Locker._wait(obj) }, 20);
};

Locker._waitManual = function (obj) {
    Locker._runningQueue[obj] = true;
    var isLocked = Locker.locks[obj];
    if (!isLocked) {
        var _callback = Locker._lockQueue[obj].shift();
        if (_callback === undefined) {
            Locker._runningQueue[obj] = false;
            return;
        }
        Locker.locks[obj] = true;
        _callback[0].call(this);
    }
    setTimeout(function () { Locker._waitManual(obj) }, 20);
};

Locker._prioritizeQueue = function (obj) {
    var sorted = Locker._lockQueue[obj].sort(function (a, b) { return a[1] - b[1] });
    if (Locker._lockQueue[obj].length === sorted.length)
        Locker._lockQueue[obj] = sorted;
    else
        Locker._prioritizeQueue(obj);
};

Locker.Lock = function (obj, callback, priority) {
    if (priority === undefined) priority = 10;

    if (Locker.locks[obj] === undefined) {
        Locker.locks[obj] = true;
        callback.call(this);
        Locker.locks[obj] = false;
    } else {
        if (Locker._lockQueue[obj] === undefined) {
            Locker._lockQueue[obj] = [];
        }
        if (Locker._runningQueue[obj] === undefined) {
            Locker._runningQueue[obj] = false;
        }
        Locker._lockQueue[obj].push([callback, priority]);
        Locker._prioritizeQueue(obj);
        if (!Locker._runningQueue[obj])
            Locker._wait(obj);
    }
};

Locker.LockManual = function (obj, callback, priority) {
    if (priority === undefined) priority = 10;

    if (Locker.locks[obj] === undefined) {
        Locker.locks[obj] = false;
    }
    if (Locker._lockQueue[obj] === undefined) {
        Locker._lockQueue[obj] = [];
    }
    if (Locker._runningQueue[obj] === undefined) {
        Locker._runningQueue[obj] = false;
    }
    Locker._lockQueue[obj].push([callback, priority]);
    Locker._prioritizeQueue(obj);
    if (!Locker._runningQueue[obj])
        Locker._waitManual(obj);
};

Locker.Release = function(obj) {
    Locker.locks[obj] = false;
}
