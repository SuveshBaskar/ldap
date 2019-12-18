const ldap = require('ldapjs')
const config = require('./config')

const ldapOptions = {
  url: 'ldap://www.zflexldap.com:389'
}

let authenticate = (userName, password) => {
  return new Promise((resolve, reject) => {
    const ldapClient = ldap.createClient(ldapOptions)

    ldapClient.bind(
      `uid=${userName},ou=users,ou=guests,dc=zflexsoftware,dc=com`,
      password,
      (err, res) => {
        if (err) {
          ldapClient.unbind()
          reject()
        }

        let opts = {
          filter: `(&(uid=${userName}))`,
          scope: 'sub',
          attributes: ['dn', 'uid', 'cn']
        }

        ldapClient.search(
          `uid=${userName},ou=users,ou=guests,dc=zflexsoftware,dc=com`,
          opts,
          function(err, res) {
            if (err) console.error('error: ' + err.message)

            res.on('searchEntry', function(entry) {
              console.log('entry: ' + JSON.stringify(entry.object))
            })
            res.on('searchReference', function(referral) {
              console.log('referral: ' + referral.uris.join())
            })
            res.on('error', function(err) {
              console.error('error: ' + err.message)
            })
            res.on('end', function(result) {
              console.log('status: ' + result.status)
            })
          }
        )

        ldapClient.unbind()
        resolve()
      }
    )
  })
}

authenticate('guest', 'guest3password')
  .then(() => console.log('Authentication Success'))
  .catch(() => console.log('Authencation Failed'))
