const presets = [
  [
    "@babel/env",
    // {
    //   "useBuiltIns": "usage",
    //   "corejs": 3
    // }
  ],
  {
    "plugins": [
      [
        "@babel/plugin-transform-runtime",
        {
          "corejs": 3
        }
      ]
    ]
  }
];

module.exports = { presets };