defmodule Mix.Tasks.Phx.Gen.Theme do
  use Mix.Task

  @start_apps [
    :porcelain
  ]

  @shortdoc "Import Tim's Creative's Material Dashboard Pro & Damien's phoenix_form.js"

  @moduledoc """

  """

  @doc false
  def run(args) do
    # Application.put_env(:phoenix, :serve_endpoints, true, persistent: true)
    # Mix.Tasks.Run.run(run_args() ++ args)

    run_args()
  end

  defp run_args() do
    Enum.each(@start_apps, &Application.ensure_all_started/1)
    IO.puts("importing Material Dashboard")

    server = Application.get_env(:red_potion, :server)
    project = Application.get_env(:red_potion, :project)
    app_dir = Application.app_dir(:phoenix)

    material_app_ex =
      File.cwd!() <> "/lib/#{project.alias_name}_web/templates/layout" <> "/app.html.eex"

    Mix.Generator.create_file(
      material_app_ex,
      EEx.eval_file("#{app_dir}/priv/templates/layout/material_app.html.eex", project: project)
    )

    utility_ex = File.cwd!() <> "/lib//utility.ex"

    Mix.Generator.create_file(
      utility_ex,
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.theme/utility.ex", project: project)
    )

    Mix.Generator.create_file(
      File.cwd!() <> "/lib//#{project.alias_name}_web/controllers/api_controller.ex",
      EEx.eval_file("#{app_dir}/priv/templates/phx.gen.theme/api_controller.ex", project: project)
    )

    ~s(\r\n\r\nPlease put the following routes to your router.ex\r\n\r\n\tscope \"/api\", MyAppWeb do\r\n\t  pipe_through \:api\r\n\t  get\(\"/webhook\", ApiController, :webhook\)\r\n\t  post\(\"/webhook\", ApiController, :webhook_post\)\r\n\t  delete\(\"/webhook\", ApiController, :webhook_delete\)\r\n\tend\r\n\r\n)
    |> IO.puts()

    material_dashboard_assets = "#{app_dir}/priv/static/assets"
    File.cp_r(material_dashboard_assets, File.cwd!() <> "/priv/static")

    []
  end
end
