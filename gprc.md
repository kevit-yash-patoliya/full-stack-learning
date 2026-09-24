
### features :

* binary serialising style
* HTTP/2 and Protocol Buffers
* stremming data 
    1. Request to stream data



### Flow of gRPC


```
JavaScript object
      ↓
Protobuf serialization
      ↓
Binary data
      ↓
HTTP/2
      ↓
Network
      ↓
Protobuf deserialization
      ↓
JavaScript object
```