module.exports = {
  react: function(data) {
      data.html =
          "<div id='root'></div>" +
          "<script crossorigin src='//unpkg.com/react@16/umd/react.development.js'></script>" +
          "<script crossorigin src='//unpkg.com/react-dom@16/umd/react-dom.development.js'></script>" +
          (data.html || "")
  },
};
