JsLocks
=======

Things  break. Codes break. Javascript - they don't just break, they break everything along with it. Being the simplest language has its downsides. But one of the common reasons that happen is people tend to forget that everything in JS is asynchronous. Every single line of code.

You probably would get away with it, if you're writing simple applications. But when complexity increases, it almost becomes impossible to solve certain problems with the async design pattern, not without a locking mechanism. Especially, in a Javascript environment due to its full async nature making timing absolutely unreliable and unpredictable. And since locking is a common multi-thread environment and while Js in most common environments will run on a single-thread and due to only simplistic tasks being performed with it, the old days never saw a need for locking. But for today's complex applications, you just need performant and reliable locking. There no way around it.

And that's exactly what the below tiny (2kb) library provides.


Basic usage:


    Function getALife() {

        Locker.Lock("thebiglock", function() {
            DoSomeWork();
            FetchNewAjaxContentAndReplaceMyMainContent();
        });
    };

You could see how the above just cannot work without locking. Without this locking, executing getALife even twice in a row, basically ruins your life. Since you have no idea when you'll get the ajax request back. You have no way of knowing if they will work in order. Instead, your requests will get mangled up, and you have no way to load items in parallel without messing up the order. While this is a simple example, its uses go much further.

The above is a auto-release lock. If you want manual control over the locks, just use the ManualLock and Release functions. It'd be incredibly useful to nest it deep down in the async callback hierarchy. Say, to couple it with jQuery animate's call back for after animate for example.

    Locker.LockManual("thebiglock", function() {
        DoSomeWork();
        $("MyLife").animate( "fast", function() {
            FetchNewAjaxContentAndReplaceMyMainContent();
            Locker.Release("thebiglock");
        });
    }); 

Now this makes it work exactly as you'd except. And you can call the Locker.Release from anywhere, even from an external call or not even at all (of course, in which case you're tasks are going to keep getting piled up until you do.)

And last but not the least - Priorities.

    Locker.Lock("thebiglock", function() {
        DoSomeWork();
        FetchNewAjaxContentAndReplaceMyMainContent();
    }, 20);

The default priority of jobs is 10.  The lower the value, higher the priority. (If you're asking why not the other way, which you shall be right to ask, as it just wouldn't make sense to reverse the natural thinking process, it CAN easily be done to make more semantic sense, but that'd mean an extra sort, or not to use the native Javascript sort function without another sorting reference. While it may not be a big deal, I'd prefer to maximize the performance. But help yourself with the internal prioritizeQueue function to implement your own.

Priority values example:

    var test = function(no) {
        var priority = Math.ceil(Math.random() * 10);
        Locker.Lock("t1", function () {
                console.log("Task no: " + no + ", Priority: " + priority);
        }, priority);
    };
    
    for (var i=0; i<10; i++) {
        test(i);
    }

Output:

    Task no: 0, Priority: 5
    Task no: 1, Priority: 1
    Task no: 4, Priority: 2
    Task no: 6, Priority: 2
    Task no: 9, Priority: 2
    Task no: 8, Priority: 3
    Task no: 2, Priority: 4
    Task no: 5, Priority: 4
    Task no: 7, Priority: 6
    Task no: 3, Priority: 7

As you'd expect, the locking mechanism makes it a reliable tasking system. Extend, modify and utilize it at will. Have fun!

PVL
