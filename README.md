Home In Touch
=============

Install
-------

    git clone https://jed@github.com/jed/homeintouch.git
    cd homeintouch
    npm install

Run
---

In a shell, make sure that the home server is running, and leave the shell open:

    ssh trendsetterin.selfhost.eu:8081
    jedtest1219
    node server.js

In another shell, start the local server:

    node server.js --clientonly

Flow
----

1. Server startup
  - sets up socket connections
  - exposes http and socket.io

2. Client startup
  - loads all resources from server
  - renders root app
  - connects to server

3. Communication
  - server emits "homes" event with all data
  - server/client emit "address" event when an address changes
  - client emits "save" with same format as "homes" to save state
  - client updates views whenever a device state changes

Models
------

The models are pretty straightforward, mostly forming a hierarchy in which each model contains a list of its submodels. Each model needs to be able to be added and deleted. Modifying is a nice-to-have that can be accomplished with by deleting and re-adding.

### Home
 - id
 - name
 - floors

### Floor
 - id
 - name
 - rooms

### Room
 - id
 - name
 - device_groups

### DeviceGroup
 - id
 - name
 - devices

### Device
 - id
 - name
 - device_type
 - addresses

### Address
 - id
 - current_value

### DeviceType
 - id
 - name
 - address_names

### App
 - current_room
 - current_floor
 - current_home

User interface
--------------

The UI should look something like this. A navbar allows the user to select the home they're viewing in the upper right, and from that home select a given room using the floor dropdowns.

    Logo [Ground Floor \/ | Basement \/ | New floor...]        [ Home 1 \/ ]

    +----------------------------------------------------------------------+
    | Bedroom                                                          | + |
    +----------------------------------------------------------------------+
    +--------------------+   +--------------------+
    | Lights             |   | New Light          |
    |                    |   |                    |
    | Lamp 1 [ON]  OFF   |   | Light name         |
    | Lamp 2  ON  [OFF]  |   | ____________       |
    |                    |   | Read address       |
    |                    |   | ____________       |
    |                    |   | Write address      |
    |                    |   | ____________       |
    |                    |   |                    |
    +--------------------+   +--------------------+
    |                | + |   | Cancel |    | Save |
    +--------------------+   +--------------------+

Each room consists of a sub-navbar showing the room name and a button for adding a new group, and _n_ rows of up to three device groups. Each device group panel has two modes: a read mode (shown in the left group) in which the status of each device can be viewed and changed, and a write mode (shown in the middle group) in which a given device within the group can be modified.

Communication
-------------

All interaction with the server is performed via Socket.IO.

    socket.on("connect", function(){})
    socket.on("disconnect", function(){})
    socket.on("homes", function(homes){})
    socket.on("address", function(id, value){})

    socket.emit("save", home)

Sample addresses
----------------

### Lights/Motion/Szenes/Window(open/closed):

- Office,1/0/0,write (0/1)
- Office,1/0/1,read
- Bathroom,2/0/0,write
- Bathroom,2/0/1,read
- Kitchen,5/0/0,write
- Kitchen,5/0/1,read

- Motion_Floor,6/0/2,read (0/1) // no motion/motion detected

- Szene_TV,0/7/0,write (0/1) //Fire and Forget

- Window_Bathroom,0/4/1,read (0/1) // opened/closed

### Dimmer:

- Couch,3/1/5,write (1/0)
- Couch,3/1/6,read
- Couch,3/1/8,write (0-255)
- Couch,3/1/9,read
- Passage,3/1/0,write
- Passage,3/1/1,read
- Passage,3/1/3,write
- Passage,3/1/4,read
- Dinner,4/1/5,write
- Dinner,4/1/6,read
- Dinner,4/1/8,write
- Dinner,4/1/9,read

### Thermostat:

- Livingroom,3/2/1,write (1/2/3/4) // 1=comfort,2=standby,3=night,4=frost
- Livingroom,3/2/3,read // Temperature Ist
- Livingroom,3/2/4,read // Temperature Soll
- Livingroom,3/2/5,write // Set temperature
- Livingroom,3/2/6,read // Mode

### Shutters:

- Fireplace,4/3/2,write (0/1) // up/down
- Fireplace,4/3/3,write //stop
- Fireplace,4/3/7,write (0-255) 
- Fireplace,4/3/8,read