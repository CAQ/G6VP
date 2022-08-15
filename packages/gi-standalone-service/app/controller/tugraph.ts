import { Controller } from 'egg';
import { responseData } from '../util';

class TuGraphController extends Controller {
  /**
   * 创建 GraphScope 实例
   */
  async connect() {
    const { ctx } = this;
    const params = ctx.request.body;
    console.log(params);
    const { username, password } = params;
    const result = await ctx.service.tugraph.connect(username, password);
    responseData(ctx, result);
  }

  async queryByGraphLanguage() {
    const { ctx } = this;
    const params = ctx.request.body;
    const queryParams = {
      ...params,
      authorization: ctx.request.header.authorization,
    };

    const result = await ctx.service.tugraph.queryByGraphLanguage(queryParams);
    responseData(ctx, result);
  }

  /**
   * 邻居查询
   */
  async queryNeighbors() {
    const { ctx } = this;
    const params = ctx.request.body;

    const result = await ctx.service.tugraph.queryNeighbors(params);
    responseData(ctx, result);
  }

  /**
   * 获取 Schema
   */
  // async getSchema() {
  //   const { ctx } = this;
  //   const { graphName } = ctx.query;

  //   const result = await ctx.service.tugraph.queryGraphSchema(graphName);
  //   responseData(ctx, result);
  // }

  /**
   * 获取元素的属性详情
   */
  // async queryElementProperties() {
  //   const { ctx } = this;
  //   const params = ctx.request.body;

  //   const result = await ctx.service.graphcompute.queryElementProperties(params);
  //   responseData(ctx, result);
  // }
}

export default TuGraphController;
