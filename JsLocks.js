var Locker = function () { };
Locker.locks = {};
Locker._lockQueue = {};
Locker._runningQueue = {};

// Internal Functions

Locker._init = function (obj, priority, parallelLock) {
    if (priority === undefined) priority = 0;
    if (parallelLock === undefined) {
        if (Locker.locks[obj] === undefined) {
            Locker.locks[obj] = false;
        }
    } else {
        if (Locker.locks[obj] === undefined) {
            Locker.locks[obj] = 0;
        }
    }
    if (Locker._lockQueue[obj] === undefined) {
        Locker._lockQueue[obj] = [];
    }
    if (Locker._runningQueue[obj] === undefined) {
        Locker._runningQueue[obj] = false;
    }
}

Locker._process = function (obj, mode) {
    Locker._prioritizeQueue(obj);
    if (!Locker._runningQueue[obj])
    if (mode === 2) {
            Locker._pLocker(obj);
    } else {
            Locker._wait(obj, mode);
    }
}

Locker._wait = function (obj, mode) {
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
        if (_callback[0] !== undefined)
            _callback[0].call(this);
        if (mode === 0)
            Locker.locks[obj] = false;
    }
    setTimeout(function () { Locker._wait(obj, mode) }, 20);
};

Locker._prioritizeQueue = function (obj) {
    var sorted = Locker._lockQueue[obj].sort(function (a, b) { return a[1] - b[1] });
    if (Locker._lockQueue[obj].length === sorted.length)
        Locker._lockQueue[obj] = sorted;
    else
        Locker._prioritizeQueue(obj);
};

// Exposed Core Functions

Locker.Lock = function (obj, callback, priority) {
    Locker._init(obj, priority);
    Locker._lockQueue[obj].push([callback, -priority]);
    Locker._process(obj, 0);
};

Locker.LockManual = function (obj, callback, priority) {
    Locker._init(obj, priority);
    Locker._lockQueue[obj].push([callback, -priority]);
    Locker._process(obj, 1);
};

Locker.Release = function (obj) {
    Locker.locks[obj] = false;
};

Locker.DiscardQueue = function (obj) {
    Locker._lockQueue[obj] = []
};

// Exposed Extra functions

Locker.LockManualIfInstant = function (obj, callback, priority) {
    if (Locker._lockQueue[obj].length === 0 && Locker.locks[obj])
        Locker.LockManual(obj, callback, priority);
};

Locker.LockIfInstant = function (obj, callback, priority) {
    if (Locker._lockQueue[obj].length === 0 && Locker.locks[obj])
        Locker.Lock(obj, callback, priority);
};
