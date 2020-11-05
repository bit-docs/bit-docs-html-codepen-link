module.exports = {
  react: function(data) {
      data.html =
          '<div id="root"></div>\n' +
          '<script crossorigin src="//unpkg.com/react@16/umd/react.development.js"></script>\n' +
          '<script crossorigin src="//unpkg.com/react-dom@16/umd/react-dom.development.js"></script>\n' +
          (data.html || "")
  },
};
