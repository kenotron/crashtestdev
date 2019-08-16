module.exports = {
  plugins: [
    {
      resolve: `gatsby-theme-blog`,
      options: {},
    },
    {
      resolve: `gatsby-plugin-netlify-cms`,
      options: {
        /**
         * One convention is to place your Netlify CMS customization code in a
         * `src/cms` directory.
         */
        modulePath: `${__dirname}/src/cms/cms.js`,
      },
    },
  ],
  // Customize your site metadata:
  siteMetadata: {
    title: `Crash Test Dev`,
    author: `Ken Chau`,
    description: `Why do I need a description. For a site. The site IS a description.`,
    social: [
      {
        name: `twitter`,
        url: `https://twitter.com/kenneth_chau`,
      },
      {
        name: `github`,
        url: `https://github.com/kenotron`,
      },
    ],
  },
}
