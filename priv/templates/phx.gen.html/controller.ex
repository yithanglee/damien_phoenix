defmodule <%= inspect context.web_module %>.<%= inspect Module.concat(schema.web_namespace, schema.alias) %>Controller do
  use <%= inspect context.web_module %>, :controller

  alias <%= inspect context.module %>
  alias <%= inspect schema.module %>
  import Ecto.Query
  def index(conn, params) do
    if Enum.any?(conn.path_info, fn x -> x == "api" end) do
      limit = String.to_integer(params["length"])
      offset = String.to_integer(params["start"])

      col_key = params["columns"] |> Map.keys()

      search_queries =
        for key <- col_key do
          val = params["columns"][key]["search"]["value"]

          if val != "" do
            {String.to_atom(params["columns"][key]["data"]), val}
          end
        end
        |> Enum.reject(fn x -> x == nil end)
        |> Enum.reject(fn x -> elem(x, 1) == nil end)

      column_no = params["order"]["0"]["column"]
      key = params["columns"][column_no]["data"] |> String.to_atom()
      dir = params["order"]["0"]["dir"] |> String.to_atom()
      order_by = [{dir, key}]

      dirs =
        for ord <- params["order"] |> Map.keys() do
          key = params["columns"][params["order"][ord]["column"]]["data"] |> String.to_atom()
          dir = params["order"][ord]["dir"] |> String.to_atom()

          {dir, key}
        end

      order_by = dirs

      q1 = from(a in <%= inspect schema.alias %>)

      q1 = 
        if params["name"] != nil do
          q1 |> where([a], a.name == ^params["name"])
        else 
          q1 
        end

      q1 =
        if search_queries != [] do
          q1 |> where(^search_queries)
        else
          q1
        end

      q2 = 
        from(
          a in <%= inspect schema.alias %>,
          limit: ^limit,
          offset: ^offset,
          order_by: ^order_by
        )

      q2 =
        if params["name"] != nil do
          q2 |> where([a], a.name == ^params["name"])
        else
          q2
        end

      q2 =
        if search_queries != [] do
          q2 |> where(^search_queries)
        else
          q2
        end


      data =
        Repo.all(q1)

      data2 =
        Repo.all(q2)
        |> Enum.map(fn x -> Utility.s_to_map(x) end)
        
      json =
      %{
        data: data2,
        recordsTotal: Enum.count(data2),
        recordsFiltered: Enum.count(data),
        draw: String.to_integer(params["draw"])
      }
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(
        200,
        Jason.encode!(json)
      )
    else
      <%= schema.plural %> = <%= inspect context.alias %>.list_<%= schema.plural %>()
      render(conn, "index.html", <%= schema.plural %>: <%= schema.plural %>)
    end 
  end

  def new(conn, _params) do
    changeset = <%= inspect context.alias %>.change_<%= schema.singular %>(%<%= inspect schema.alias %>{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{<%= inspect schema.plural %> => <%= schema.singular %>_params}) do
    if Enum.any?(conn.path_info, fn x -> x == "api" end) do
        if <%= schema.singular %>_params["id"] != nil do
          <%= schema.singular %> = 
          if <%= schema.singular %>_params["id"] == "0" do
            nil 
            else
            <%= inspect context.alias %>.get_<%= schema.singular %>!( <%= schema.singular %>_params["id"] )
          end

          if <%= schema.singular %> == nil do
              case <%= inspect context.alias %>.create_<%= schema.singular %>(<%= schema.singular %>_params) do
                {:ok, <%= schema.singular %>} ->
                  conn
                  |> put_resp_content_type("application/json")
                  |> send_resp(200, Jason.encode!(Utility.s_to_map(<%= schema.singular %>)))
                {:error, %Ecto.Changeset{} = changeset} ->
                  errors = changeset.errors |> Keyword.keys()

                  {reason, message} = changeset.errors |> hd()
                  {proper_message, message_list} = message
                  final_reason = Atom.to_string(reason) <> " " <> proper_message

                  conn
                  |> put_resp_content_type("application/json")
                  |> send_resp(500, Jason.encode!(%{status: final_reason}))
              end
          else
              case <%= inspect context.alias %>.update_<%= schema.singular %>(<%= schema.singular %>, <%= schema.singular %>_params) do
                {:ok, <%= schema.singular %>} ->
                  conn
                  |> put_resp_content_type("application/json")
                  |> send_resp(200, Jason.encode!(Utility.s_to_map(<%= schema.singular %>)))
                {:error, %Ecto.Changeset{} = changeset} ->
                  errors = changeset.errors |> Keyword.keys()

                  {reason, message} = changeset.errors |> hd()
                  {proper_message, message_list} = message
                  final_reason = Atom.to_string(reason) <> " " <> proper_message

                  conn
                  |> put_resp_content_type("application/json")
                  |> send_resp(500, Jason.encode!(%{status: final_reason}))
              end
          end 
        
        end 
    else
      case <%= inspect context.alias %>.create_<%= schema.singular %>(<%= schema.singular %>_params) do
        {:ok, <%= schema.singular %>} ->
          conn
          |> put_flash(:info, "<%= schema.human_singular %> created successfully.")
          |> redirect(to: Routes.<%= schema.route_helper %>_path(conn, :show, <%= schema.singular %>))
        {:error, %Ecto.Changeset{} = changeset} ->
          render(conn, "new.html", changeset: changeset)
      end
    end
  end

  def show(conn, %{"id" => id}) do
    <%= schema.singular %> = <%= inspect context.alias %>.get_<%= schema.singular %>!(id)
    render(conn, "show.html", <%= schema.singular %>: <%= schema.singular %>)
  end

  def edit(conn, %{"id" => id}) do
    <%= schema.singular %> = <%= inspect context.alias %>.get_<%= schema.singular %>!(id)
    changeset = <%= inspect context.alias %>.change_<%= schema.singular %>(<%= schema.singular %>)
    render(conn, "edit.html", <%= schema.singular %>: <%= schema.singular %>, changeset: changeset)
  end

  def update(conn, %{"id" => id, <%= inspect schema.singular %> => <%= schema.singular %>_params}) do
    <%= schema.singular %> = <%= inspect context.alias %>.get_<%= schema.singular %>!(id)

    case <%= inspect context.alias %>.update_<%= schema.singular %>(<%= schema.singular %>, <%= schema.singular %>_params) do
      {:ok, <%= schema.singular %>} ->
        conn
        |> put_flash(:info, "<%= schema.human_singular %> updated successfully.")
        |> redirect(to: Routes.<%= schema.route_helper %>_path(conn, :show, <%= schema.singular %>))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "edit.html", <%= schema.singular %>: <%= schema.singular %>, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    <%= schema.singular %> = Repo.get(<%= inspect schema.alias %> , (id))

    if <%= schema.singular %> != nil do
        {:ok, _<%= schema.singular %>} = <%= inspect context.alias %>.delete_<%= schema.singular %>(<%= schema.singular %>)

      if Enum.any?(conn.path_info, fn x -> x == "api" end) do
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Jason.encode!(%{status: "ok"}))
      else
        conn
        |> put_flash(:info, "<%= schema.human_singular %> deleted successfully.")
        |> redirect(to: Routes.<%= schema.route_helper %>_path(conn, :index))
      end
    else
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(200, Jason.encode!(%{status: "already deleted"}))
    end
  end
end
