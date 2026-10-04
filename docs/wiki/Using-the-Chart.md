# Using the Chart

The diagram shows, against time: the **aircraft altitude** (blue line), the **ground height** (brown profile) and the
**height above ground** (the band between them). Heights are in feet; the **ft** button switches to metres.

![The chart zoomed in on a low pass; the dashed line follows the pointer](images/demo-dark-zoom.png)

## Zoom, scroll, move the playhead

| Do | With |
|---|---|
| zoom | mouse wheel (around the pointer), the **+** / **−** buttons, the **+** / **−** keys |
| scroll in time | drag sideways, **Ctrl + wheel** (also Shift + wheel or a horizontal wheel), the **←** / **→** keys |
| show everything | the **↔** button, double-click, **Home** |
| move the playhead | click in the diagram; the chart sends a `seek` event, the page decides what to do with it |
| touch | one finger drags, two fingers pinch |

The keys work while the diagram has the focus (Tab to it). Every action has a button as well, at least 44 px high.

## Reading values

Move the pointer over the diagram: the line below it shows the time, the altitude, the ground height and the height above
ground **at that spot**. Without a pointer (touch, keyboard) it shows the values at the playhead. Below it are the
**lowest height above ground**, the **highest altitude** and the **highest ground** of the whole flight.

A negative height above ground means the recorded altitude is below the terrain model, for example because the recording
was made on another scenery or the altitude carries an offset.

## Without ground data

If the page gives no `ground`, only the altitude is drawn and a note says so.

## Light and dark

The chart takes its text colour from the page (`color`) and switches line and fill colours between a light-page and a
dark-page set; it also reacts to the system colour scheme and to a `data-theme` or `class` change on `<html>`.
