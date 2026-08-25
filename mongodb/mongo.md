# (1) with $elemMatch or without $elemMatch 

**1. Without $elemMatch**
```
The conditions are still combined with AND.
But each condition can be satisfied by a different element in the array.
```
**2. With $elemMatch**
```
The conditions are combined with AND.
The **any one** array element must satisfy all the conditions.

```

**more :**
`https://chatgpt.com/s/t_6a5daf73d1a88191a7abbaad2ed341f0`
`https://chatgpt.com/s/t_6a5db15e05a88191b0c952d2d5650d12`


# (2) Querying an Array of Embedded Documents

```
{
  _id: ObjectId(...),
  name: "Miyu Kato",
  country: "Japan",
  wimbledon_doubles_placements: 
  [{ 
    year: 2016,
    place: 2
  }, 
  { 
    year: 2017,
    place: 1
  },
  { 
    year: 2018,
    place: 1
  },
  { 
    year: 2019,
    place: 1
  }]
}
```
**embeded for multple**
`db.tennis_players.find( { "wimbledon_doubles_placements": { year: 2019, place: 2 } } )`

**embeded for singal**
`db.tennis_players.find( { "wimbledon_doubles_placements.year": 2016 } )`


# (3) update by index for array

```
db.nbateams.updateOne(
  { team: "Chicago Bulls" }, 
  { $set: {"championships.1": 1992 }}
)
```
### for objects

```
db.nbateams.updateOne(
  { team: "Chicago Bulls" },
  {
    $set: {
      "championships.1.year": 1994
    }
  }
)
```


# (4) similer to update one but it will return updated docs

```
db.listingsAndReviews.findAndModify({ query: { name: "Jolie Cantina" }, update: { cuisine: "American" }, new: true })
```

# (5) Diff between replaceOne() v/s updateOne()

**Notice how the other fields were completely removed. This is the key difference between .replaceOne() and .updateOne(). Whereas .updateOne() updates specific fields based on the update modifiers provided, .replaceOne() replaces the entire document and will only include fields specified in the <replacement> parameter.**

# (6) indexing 


**types** 
**1. single-field index**
**2. compound indexes**
**3. multikey indexes**

# (7) Aggregation

**Most of the CRUD methods that MongoDB offers are operational in nature. Their role is to perform some specific operation on our data and that’s it. With aggregation pipelines, we are able to perform multiple operations together to curate data that is more analytical in nature. This helps us see our data in a bigger picture.**

# (8) What is Composability?

**Build a complex solution by combining many small, independent pieces.**

# (9) $project v/s $set 

```
{
  _id: 1,
  name: "Yash",
  age: 22,
  city: "Rajkot",
  salary: 50000
}
```
Now you want to add just one field.

For example:

`isAdult = true`

Many beginners write
```
{
  $project: {
    _id: 1,
    name: 1,
    age: 1,
    city: 1,
    salary: 1,
    isAdult: {
      $gte: ["$age", 18]
    }
  }
}
```
Notice something?

**You only wanted one new field, but you had to list every existing field.**

**Better Solution: $set**

Instead write
```
db.users.aggregate([
  {
    $set: {
      isAdult: {
        $gte: ["$age", 18]
      }
    }
  }
])
```
MongoDB internally keeps everything else.


# (10) explain() it gives execution plan for specific query

```
// QueryPlanner verbosity  (default if no verbosity parameter provided)
db.coll.explain("queryPlanner").aggregate(pipeline);
```
```
// ExecutionStats verbosity
db.coll.explain("executionStats").aggregate(pipeline);
```
```
// AllPlansExecution verbosity 
db.coll.explain("allPlansExecution").aggregate(pipeline);
```


https://chatgpt.com/s/t_6a5ef7ac6b9881918e2e785fb04fa6a5


# (11) Optimization

https://www.practical-mongodb-aggregations.com/guides/expressions.html


# (12) all operators and expressions

https://chatgpt.com/s/t_6a5f047c32688191923eef07b3b1b7f4

# (13) Sharding 

https://chatgpt.com/s/t_6a5f0ae12eec81919768928bab06672e

# (14) WARM UP with mongodb aggregation

```
db.movies.aggregate([{
    $set:{
  			writers:{
          $filter:{
            input:"$writers",
            as:"tag",
            cond:{
              "$regexMatch":{
                input:"$$tag",
                regex:"^A"
              }
            }
          }
        }	  
  	}
  },{
  $project:{
    writers:1
  }
  
  },{$unwind:{
    path:"$writers"
  }}
])
```
https://chatgpt.com/s/t_6a5f16ebcd4481919e2c3d89eda295d2


### EX.2
```
data:
{
    customer_id: "alice@gmail.com",
    orderdate: ISODate("2020-01-10"),
    value: NumberDecimal("120.50")
}

{
    customer_id: "alice@gmail.com",
    orderdate: ISODate("2020-02-15"),
    value: NumberDecimal("75.00")
}

{
    customer_id: "bob@gmail.com",
    orderdate: ISODate("2020-03-20"),
    value: NumberDecimal("300.00")
}
```
### This is full pipline for above example data 
**The goal is to generate one document per customer showing:**
- First purchase date
- Total order value
- Total number of orders
- List of all orders
**This is exactly what $group is for.**
```
db.orders.aggregate([
  {
    $match: {
      orderdate: {
        $gte: ISODate("2020-01-01"),
        $lt: ISODate("2021-01-01")
      }
    }
  },
  {
    $sort: {
      orderdate: 1
    }
  },
  {
    $group: {
      _id: "$customer_id",

      first_purchase_date: {
        $first: "$orderdate"
      },

      total_value: {
        $sum: "$value"
      },

      total_orders: {
        $sum: 1
      },

      orders: {
        $push: {
          orderdate: "$orderdate",
          value: "$value"
        }
      }
    }
  },
  {
    $sort: {
      first_purchase_date: 1
    }
  },
  {
    $set: {
      customer_id: "$_id"
    }
  },
  {
    $unset: "_id"
  }
])
```



### how to use distinct like sql

```
https://chatgpt.com/s/t_6a5f28b83ad48191a4d460a2c0f8f5fb
```

### for unpack array use unwind

  - **give a name in array**  

### join multiple lookups with diff conditions

https://chatgpt.com/s/t_6a5f4073b16881918e7932c489c750a6


# (15) Strong type conversion


https://chatgpt.com/s/t_6a5f45511234819195e043cc36b15251


# (16) Convert Incomplete Date Strings

https://chatgpt.com/s/t_6a5f4806dc8c819197ae9714bd813063


# (17) faceted classification

https://chatgpt.com/s/t_6a5f51a59a0481919268116c1fa9c6b2

# (18) Largest Graph Network
```
{
  $graphLookup: {
      from: "users",
      startWith: "$followed_by",
      connectFromField: "followed_by",
      connectToField: "name",
      depthField: "depth",
      as: "extended_network"
  }
}
```


# (19) Incremental Analytics (store the data in one separate collection)

https://chatgpt.com/s/t_6a60321f6098819191626a5da7654a0e

# (20) redacted using $redact

```
db.documents.aggregate([
  {
    $redact: {
      $switch: {
        branches: [
          {
            case: { $eq: ["$level", "top-secret"] },
            then: "$$PRUNE"
          },
          {
            case: { $eq: ["$level", "secret"] },
            then: "$$DESCEND"
          }
        ],
        default: "$$KEEP"
      }
    }
  }
])
```
# (21) Mask sensitive fields

https://chatgpt.com/s/t_6a603aa218a881918c786ba79130d6e8


# (22) Role programatic restricted view

https://chatgpt.com/s/t_6a603cec5844819181356805db436ef0

# (23) I-ot power consumption

https://chatgpt.com/s/t_6a603e108e208191b2aecb65f7002674

# (24) State Change Boundaries

# (25)  Array min max avg first and last 

- use direct min max and first etc.. on array we don't require a group for that 
```
db.sensors.aggregate([
{
    $set:{
        lowest:{
            $min:"$readings"
        },
        highest:{
            $max:"$readings"
        },
        average:{
            $avg:"$readings"
        },
        first:{
            $arrayElemAt:[
                "$readings",
                0
            ]
        },
        last:{
            $arrayElemAt:[
                "$readings",
                -1
            ]
        }
    }
}
])
```
# (26) Pivot in array


https://chatgpt.com/s/t_6a6041fc2d04819192faaf72c52c1bdc

# (27)  Percentile, median, sortArray
```
db.performance.aggregate([
  {
    $set: {
      sortedResponseTimesMillis: {
        $sortArray: {
          input: "$responseTimesMillis",
          sortBy: 1
        }
      },

      medianTimeMillis: {
        $median: {
          input: "$responseTimesMillis",
          method: "approximate"
        }
      },

      ninetiethPercentileTimeMillis: {
        $first: {
          $percentile: {
            input: "$responseTimesMillis",
            p: [0.90],
            method: "approximate"
          }
        }
      }
    }
  },

  {
    $match: {
      ninetiethPercentileTimeMillis: {
        $gt: 100
      }
    }
  },

  {
    $unset: [
      "_id",
      "datetime",
      "responseTimesMillis"
    ]
  }
]);
```


# (28) Array Fields Joining 

https://chatgpt.com/s/t_6a60490a15448191bd4b41c51b5a5ece

# (29) Comparison Of Two Arrays

https://www.practical-mongodb-aggregations.com/examples/array-manipulations/comparison-of-two-arrays.html


# $searchMeta and $search

https://chatgpt.com/s/t_6a6052c9ed1c8191a4aeee41aab31cb2