  module.exports = {
      // 默认get请求
      // Default get request
      '/api/getInfo':{
          name: '张三',
          age: 28
      },
      // 指定请求方式为post
      // Specify the request method as post
      'post /api/changeInfo':{
          message: 'success',
          status: 0
      },
      // 可以写成function的形式，从而可以根据请求参数定制响应数据
      // Can be written in the form of function, so that the response data can be customized according to the request parameters
      '/api/getOrder':function(res){
          //res.query  获取get请求参数 Get get request parameters
          //res.body   获取post请求参数 gets post request parameters
          return {
              orderId:1214124124,
              price: Math.random(),
              userName: fns => fns.str(2,4)    // 如果启用了内置mock，依然可以使用内置mock函数
              // If the built-in mock is enabled, the built-in mock function can still be used 
          }
      },
      // 也可以转发url到指定的服务器
      // You can also forward the url to the specified server
      "/v2/movie/top250": "https://api.douban.com/",
  
      // 如果没关闭内置的mock解释器，可以这样使用：
      // 更多用法参见插件说明
      // If the built-in mock interpreter is not turned off, you can use it like this:
      // For more usage, please refer to the plug-in description
      '/api/mock/parse/test':{
        "data|10":[{
          "id":"@inc(10000)",
          "age|18-30":0,
          "name":"@cstr(2,4)",
          "desc":"@cparagraph",
          "a|1":["张三","李四","王五"]
        }]
      },
      // 开启内置mock解析的时候，对象值也可以是一个函数，函数的参数是一个包含所有内置函数的对象
      // 函数形式调用可以解决 {id:"@inc(100)"} 这样占位函数永远只能返回字符串类型的问题
      // When the built-in mock analysis is turned on, the object value can also be a function, and the parameter of the function is an object that contains all the built-in functions
      // The function form call can solve the problem of {id:"@inc(100)"} so that the placeholder function can only return the string type forever
      '/api/mock/parse/testfns':{
        "data|10":[{
          "name":"@cstr(3)",
          "id":mock=>mock.inc(100),
          "rnd":()=>Math.random()
        }]
      }
      
      //内置mock解析语法参考了mock.js，不能与其同时使用
      //若需要使用mock.js，需要在设置里面将EasyMock.mockParse项设置为false
      //mock.js文档参考 http://mockjs.com/examples.html
      // The built-in mock parsing syntax refers to mock.js and cannot be used at the same time
      // If you need to use mock.js, you need to set the EasyMock.mockParse item to false in the settings
      // mock.js documentation reference http://mockjs.com/examples.html
  }
      