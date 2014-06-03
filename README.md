# NS5

```javascript
var validation_robot = new NS5({
        version: function (value) {
            return value === 5;
        }
    });

if ( !validation_robot.test({ version: 9 }) ) {
    alert('error: version should be 5');
}
```

### Yet Another Object Validation Library?

Yes indeed.

Because so far the libraries I've seen look like they have been written by Java developers
on a really bad _AbstractControllerParadigmFactory_ acid trip.

I don't send rockets over to Mars therefore I believe I deserve some simplicity.

NS5 is an attempt at making a library that is easy to use and yet fit for most common use cases.
