const logger = require('@lib/logger')
const hashManager = require('@lib/hashManager')
const tokenManager = require('@lib/tokenManager')

const userDao = require('@dao/userDao')

const userService = {
  reg: async (requestDTO) => {
    let responseDTO = null
    let hashPassword = null

    try {
      responseDTO = await userDao.selectInfo(requestDTO)

      if (responseDTO.id) {
        throw new Error('중복된 이메일입니다.')
      }

      hashPassword = await hashManager.makePasswordHash(requestDTO.password)

      logger.debug(`userService.reg - password: ${JSON.stringify(requestDTO.password)}`)
      logger.debug(`userService.reg - hashPassword: ${JSON.stringify(hashPassword)}`)

      requestDTO.password = hashPassword

      responseDTO = await userDao.insert(requestDTO)

      logger.debug(`userService.reg : ${JSON.stringify(responseDTO)}`)
    } catch (err) {
      logger.error(`userService.reg: ${err}`)

      return new Promise((resolve, reject) => {
        reject(err)
      })
    }

    return new Promise((resolve) => {
      resolve(responseDTO)
    })
  },

  info: async (requestDTO) => {
    let responseDTO = null

    try {
      responseDTO = await userDao.selectInfo(requestDTO)

      logger.debug(`userService.info: ${JSON.stringify(responseDTO)}`)
    } catch (err) {
      logger.error(`userService.info: ${err.message.toString()}`)

      return new Promise((resolve, reject) => {
        reject(err)
      })
    }

    return new Promise((resolve) => {
      resolve(responseDTO)
    })
  },
  infoByNickname: async (requestDTO) => {
    let responseDTO = null

    try {
      responseDTO = await userDao.selectInfoByNickname(requestDTO)

      logger.debug(`userService.info: ${JSON.stringify(responseDTO)}`)
    } catch (err) {
      logger.error(`userService.info: ${err.message.toString()}`)

      return new Promise((resolve, reject) => {
        reject(err)
      })
    }

    return new Promise((resolve) => {
      resolve(responseDTO)
    })
  },
  editPassword: async (requestDTO) => {
    let responseDTO = null
    let hashPassword = null

    try {
      hashPassword = await hashManager.makePasswordHash(requestDTO.password)

      logger.debug(`userService.edit - password: ${JSON.stringify(requestDTO.password)}`)
      logger.debug(`userService.edit - hashPassword: ${JSON.stringify(hashPassword)}`)

      requestDTO.password = hashPassword

      responseDTO = await userDao.update(requestDTO)

      logger.debug(`userService.edit: ${JSON.stringify(responseDTO)}`)
    } catch (err) {
      logger.error(`userService.edit: ${err.message.toString()}`)

      return new Promise((resolve, reject) => {
        reject(err)
      })
    }

    return new Promise((resolve) => {
      resolve(responseDTO)
    })
  },
  editNickname: async (requestDTO) => {
    let responseDTO = null

    try {
      responseDTO = await userDao.update(requestDTO)

      logger.debug(`userService.edit: ${JSON.stringify(responseDTO)}`)
    } catch (err) {
      logger.error(`userService.edit: ${err.message.toString()}`)

      return new Promise((resolve, reject) => {
        reject(err)
      })
    }

    return new Promise((resolve) => {
      resolve(responseDTO)
    })
  },
  editIsConfirm: async (requestDTO) => {
    let responseDTO = null

    try {
      responseDTO = await userDao.update(requestDTO)

      logger.debug(`userService.edit: ${JSON.stringify(responseDTO)}`)
    } catch (err) {
      logger.error(`userService.edit: ${err.message.toString()}`)

      return new Promise((resolve, reject) => {
        reject(err)
      })
    }

    return new Promise((resolve) => {
      resolve(responseDTO)
    })
  },
  delete: async (requestDTO) => {
    let responseDTO = null

    try {
      responseDTO = await userDao.delete(requestDTO)

      logger.debug(`userService.delete: ${JSON.stringify(responseDTO)}`)
    } catch (err) {
      logger.error(`userService.delete: ${err.message.toString()}`)

      return new Promise((resolve, reject) => {
        reject(err)
      })
    }

    return new Promise((resolve) => {
      resolve(responseDTO)
    })
  },
  deleteForce: async (requestDTO) => {
    let responseDTO = null

    try {
      responseDTO = await userDao.deleteForce(requestDTO)

      logger.debug(`userService.delete: ${JSON.stringify(responseDTO)}`)
    } catch (err) {
      logger.error(`userService.delete: ${err.message.toString()}`)

      return new Promise((resolve, reject) => {
        reject(err)
      })
    }

    return new Promise((resolve) => {
      resolve(responseDTO)
    })
  },
  login: async (res, requestDTO) => {
    const tokenresponseDTO = null

    let selectedUserInfo = null

    try {
      selectedUserInfo = await userDao.selectUser(requestDTO)

      if (!selectedUserInfo.id) {
        throw new Error(
          `userService.login: 일치하는 유저정보가 없습니다 (email: ${JSON.stringify(requestDTO.email)})`
        )
      }

      const checkPassword = await hashManager.checkPasswordHash(
        requestDTO.password,
        selectedUserInfo.password
      )

      if (checkPassword === false) {
        throw new Error('패스워드가 일치하지 않습니다.')
      }

      await tokenManager.makeTokens(res, selectedUserInfo)
    } catch (err) {
      logger.error(`userService.login: ${err.message.toString()}`)

      return new Promise((resolve, reject) => {
        reject(err)
      })
    }

    return new Promise((resolve) => {
      resolve(tokenresponseDTO)
    })
  },
  logout: async (req, res) => {
    try {
      await tokenManager.destroyTokens(req, res)

      logger.debug(`authService.logout: 로그아웃 완료!!)`)
    } catch (err) {
      logger.error(`authService.logout: ${err.message.toString()}`)

      return new Promise((resolve, reject) => {
        reject(err)
      })
    }
  }
}

module.exports = userService