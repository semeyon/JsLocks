var Locker = function () {};
Locker.locks = {};
Locker._lockQueue = {};
Locker._runningQueue = {};

// Internal Functions

Locker._init = function (obj, priority, initValue) {
    if (priority === undefined) priority = 0;

    if (Locker.locks[obj] === undefined) {
        Locker.locks[obj] = initValue;
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
        Locker._wait(obj, mode);
}

Locker._wait = function (obj, mode) {
    Locker._runningQueue[obj] = true;
    var isLocked = Locker.locks[obj];
    if (isLocked > 0) {
        Locker.locks[obj]++;
        var _callback = Locker._lockQueue[obj].shift();
        if (_callback === undefined) {
            if (mode == 0)
                Locker.locks[obj]--;
            Locker._runningQueue[obj] = false;
            return;
        }
        if (_callback[0] !== undefined)
            _callback[0].call(this);
        if (mode == 0)
            Locker.locks[obj]--;
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
    Locker._init(obj, priority, 1);
    Locker._lockQueue[obj].push([callback, -priority]);
    Locker._process(obj, 0);
};

Locker.LockManual = function (obj, callback, priority) {
    Locker._init(obj, priority, 1);
    Locker._lockQueue[obj].push([callback, -priority]);
    Locker._process(obj, 1);
};

Locker.Release = function(obj) {
    Locker.locks[obj]++;
}

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

// Convenience Functions

Locker.MultiLock = function (obj, priority, number) {
    Locker._init(obj, priority, 0);
    var fn = function () { };
    for (var i = 0; i < number; i++) {
        Locker._lockQueue[obj].push([fn, -priority]);
    }
    Locker._process(obj, 1)
}

Locker.ZeroLock = function (obj, priority) {
    Locker.MultiLock(obj, priority, 0);
}
