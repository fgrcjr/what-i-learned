import { getUserByIdHandler } from "../handlers/users.mjs"
import { sampleUsers } from "../utils/constants.mjs"

const mockRequest = {
    findUserIndex: 1,
}
const mockResponse = {
    sendStatus: jest.fn(),
    send: jest.fn()
}

describe('get users', () => {

    it('should get user by id', () => {
        getUserByIdHandler(mockRequest, mockResponse)
        expect(mockResponse.send).toHaveBeenCalled()
        expect(mockResponse.send).toHaveBeenCalledWith(sampleUsers[1])
        expect(mockResponse.send).toHaveBeenCalledTimes(1)
        expect(mockResponse.send).not.toHaveBeenCalledTimes(2)
    })

    it('should return 404 if user not found', () => {
        const copyMockRequest = {...mockRequest, findUserIndex: 20 }
        getUserByIdHandler(copyMockRequest, mockResponse)
        expect(mockResponse.sendStatus).toHaveBeenCalled()
        expect(mockResponse.sendStatus).toHaveBeenCalledWith(404)
        expect(mockResponse.sendStatus).not.toHaveBeenCalledWith(200)
        expect(mockResponse.sendStatus).not.toHaveBeenCalledWith(400)
        expect(mockResponse.sendStatus).toHaveBeenCalledTimes(1)
        expect(mockResponse.send).not.toHaveBeenCalled()
    })

})

describe('create a user',() => {

    const mockRequest = {

    }

    const mockResponse = {

    }

    it('return status 400 when there is error', () => {
        
    })

})